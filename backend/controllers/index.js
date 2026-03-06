const { protect, recruiterOnly } = require('../middleware/auth');
const supabase = require('../utils/supabase');
const { analyzeResumeFile, generateValidationQuestions } = require('../utils/mlClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Multer Setup ──────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF/DOCX allowed'));
  },
});

// ── Helper: format job row ────────────────────────────────
function formatJob(j) {
  return {
    _id:            j.id,
    title:          j.title,
    description:    j.description,
    requiredSkills: j.required_skills || [],
    weights: {
      semantic:   j.weight_semantic,
      validation: j.weight_validation,
      impact:     j.weight_impact,
    },
    createdAt: j.created_at,
  };
}

// ── Helper: format candidate row ─────────────────────────
function formatCandidate(c) {
  return {
    _id:             c.id,
    name:            c.name,
    email:           c.email,
    resumeText:      c.resume_text,
    extractedSkills: c.extracted_skills || [],
    semanticScore:   c.semantic_score   || 0,
    skillScore:      c.skill_score      || 0,
    validationScore: c.validation_score || 0,
    finalScore:      c.final_score      || 0,
    missingSkills:   c.missing_skills   || [],
    summary:         c.summary          || '',
    status:          c.status,
    createdAt:       c.created_at,
    jobId: c.jobs ? {
      title:          c.jobs.title,
      requiredSkills: c.jobs.required_skills,
      weights: {
        semantic:   c.jobs.weight_semantic,
        validation: c.jobs.weight_validation,
      },
    } : c.job_id,
  };
}

// ═══════════════════════════════════════════════════════════
// JOB ROUTER
// ═══════════════════════════════════════════════════════════
const jobRouter = require('express').Router();

jobRouter.post('/create', protect, recruiterOnly, async (req, res) => {
  try {
    const { title, description, requiredSkills, weights } = req.body;
    if (!title || !description)
      return res.status(400).json({ error: 'Title and description required' });

    const skills = Array.isArray(requiredSkills)
      ? requiredSkills
      : (requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean);

    const { data, error } = await supabase.from('jobs').insert({
      title,
      description,
      required_skills:   skills,
      weight_semantic:   weights?.semantic   || 0.6,
      weight_validation: weights?.validation || 0.2,
      weight_impact:     weights?.impact     || 0.2,
      created_by: req.user.id,
    }).select().single();

    if (error) throw new Error(error.message);
    res.status(201).json(formatJob(data));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

jobRouter.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json(data.map(formatJob));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

jobRouter.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Job not found' });
    res.json(formatJob(data));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
// APPLY ROUTER
// ═══════════════════════════════════════════════════════════
const applyRouter = require('express').Router();

applyRouter.post('/', upload.single('resume'), async (req, res) => {
  const filePath = req.file?.path;
  try {
    const { name, email, jobId } = req.body;
    if (!name || !email || !jobId)
      return res.status(400).json({ error: 'name, email, jobId required' });
    if (!req.file)
      return res.status(400).json({ error: 'Resume file required' });

    const { data: job, error: jobErr } = await supabase
      .from('jobs').select('*').eq('id', jobId).single();
    if (jobErr || !job) return res.status(404).json({ error: 'Job not found' });

    const { data: existing } = await supabase
      .from('candidates').select('id').eq('email', email).eq('job_id', jobId).limit(1);
    if (existing?.length)
      return res.status(409).json({ error: 'Already applied to this job' });

    console.log(`[Apply] Sending to ML service...`);
    const analysis = await analyzeResumeFile(
      filePath, job.title, job.description, job.required_skills || []
    );
    console.log(`[Apply] ML score: ${analysis.semanticScore}`);

    const finalScore = parseFloat((
      (analysis.semanticScore * (job.weight_semantic || 0.6)) +
      (0 * (job.weight_validation || 0.2))
    ).toFixed(2));

    const { data: candidate, error: candErr } = await supabase
      .from('candidates').insert({
        name,
        email,
        job_id:           jobId,
        resume_text:      analysis.resumeText      || '',
        extracted_skills: analysis.extractedSkills || [],
        semantic_score:   analysis.semanticScore   || 0,
        skill_score:      analysis.skillScore      || 0,
        missing_skills:   analysis.missingSkills   || [],
        summary:          analysis.shortSummary    || '',
        final_score:      finalScore,
        status:           'processed',
      }).select().single();

    if (candErr) throw new Error(candErr.message);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(201).json({
      message:         'Application submitted successfully',
      candidateId:     candidate.id,
      semanticScore:   candidate.semantic_score,
      skillScore:      candidate.skill_score,
      missingSkills:   candidate.missing_skills,
      extractedSkills: candidate.extracted_skills,
      summary:         candidate.summary,
    });
  } catch (err) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('[Apply ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// CANDIDATES ROUTER (ranked list for a job)
// ═══════════════════════════════════════════════════════════
const candidatesRouter = require('express').Router();

candidatesRouter.get('/:jobId', protect, recruiterOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('job_id', req.params.jobId)
      .order('final_score', { ascending: false });
    if (error) throw new Error(error.message);
    res.json(data.map(formatCandidate));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
// CANDIDATE ROUTER (single candidate detail)
// ═══════════════════════════════════════════════════════════
const candidateRouter = require('express').Router();

candidateRouter.get('/:id', protect, recruiterOnly, async (req, res) => {
  try {
    const { data: c, error } = await supabase
      .from('candidates').select('*, jobs(*)').eq('id', req.params.id).single();
    if (error || !c) return res.status(404).json({ error: 'Candidate not found' });

    const { data: validation } = await supabase
      .from('validations').select('*').eq('candidate_id', c.id).maybeSingle();

    res.json({ candidate: formatCandidate(c), validation });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
// VALIDATION ROUTER
// ═══════════════════════════════════════════════════════════
const valRouter = require('express').Router();

valRouter.post('/generate/:candidateId', protect, recruiterOnly, async (req, res) => {
  try {
    const { data: cand, error: cErr } = await supabase
      .from('candidates').select('*').eq('id', req.params.candidateId).single();
    if (cErr || !cand) return res.status(404).json({ error: 'Candidate not found' });

    const { data: job } = await supabase
      .from('jobs').select('*').eq('id', cand.job_id).single();

    const questions = await generateValidationQuestions(job.title, job.required_skills || []);

    const { data: validation, error: vErr } = await supabase
      .from('validations').insert({
        candidate_id: cand.id,
        job_id:       job.id,
        questions:    JSON.stringify(questions),
      }).select().single();

    if (vErr) throw new Error(vErr.message);

    await supabase.from('candidates').update({ status: 'invited' }).eq('id', cand.id);

    const safeQs = questions.map(({ question, options }) => ({ question, options }));
    res.json({ validationId: validation.id, questions: safeQs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

valRouter.post('/submit', async (req, res) => {
  try {
    const { validationId, answers } = req.body;
    const { data: validation, error } = await supabase
      .from('validations').select('*').eq('id', validationId).single();

    if (error || !validation) return res.status(404).json({ error: 'Validation not found' });
    if (validation.submitted)  return res.status(400).json({ error: 'Already submitted' });

    const questions = typeof validation.questions === 'string'
      ? JSON.parse(validation.questions) : validation.questions;

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] !== undefined && answers[i] === q.correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);

    await supabase.from('validations').update({
      answers: JSON.stringify(answers), score, submitted: true,
    }).eq('id', validationId);

    const { data: cand } = await supabase
      .from('candidates').select('*, jobs(*)').eq('id', validation.candidate_id).single();

    const job = cand.jobs;
    const finalScore = parseFloat((
      (cand.semantic_score * (job?.weight_semantic   || 0.6)) +
      (score               * (job?.weight_validation || 0.2))
    ).toFixed(2));

    await supabase.from('candidates').update({
      validation_score: score,
      final_score:      finalScore,
      status:           'validated',
    }).eq('id', validation.candidate_id);

    res.json({ score, correct, total: questions.length, finalScore });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/validation/:validationId — MUST be last to avoid conflict
valRouter.get('/:validationId', async (req, res) => {
  try {
    const { data: validation, error } = await supabase
      .from('validations').select('*').eq('id', req.params.validationId).single();

    if (error || !validation)
      return res.status(404).json({ error: 'Validation not found' });
    if (validation.submitted)
      return res.status(400).json({ error: 'Test already submitted' });

    const questions = typeof validation.questions === 'string'
      ? JSON.parse(validation.questions) : validation.questions;

    const safeQs = questions.map(({ question, options }) => ({ question, options }));
    res.json({ validationId: validation.id, questions: safeQs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
// ANALYTICS ROUTER
// ═══════════════════════════════════════════════════════════
const analyticsRouter = require('express').Router();

analyticsRouter.get('/:jobId', protect, recruiterOnly, async (req, res) => {
  try {
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('job_id', req.params.jobId)
      .order('final_score', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);

    const skillMap = {};
    candidates.forEach(c => {
      (c.extracted_skills || []).forEach(s => {
        skillMap[s] = (skillMap[s] || 0) + 1;
      });
    });

    const avgSemantic = candidates.length
      ? (candidates.reduce((a, c) => a + c.semantic_score, 0) / candidates.length).toFixed(1) : 0;
    const avgFinal = candidates.length
      ? (candidates.reduce((a, c) => a + c.final_score, 0) / candidates.length).toFixed(1) : 0;

    res.json({
      topCandidates: candidates.slice(0, 10).map((c, i) => ({
        rank: i + 1, name: c.name,
        semanticScore:   c.semantic_score,
        validationScore: c.validation_score,
        finalScore:      c.final_score,
      })),
      skillDistribution: Object.entries(skillMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([skill, count]) => ({ skill, count })),
      metrics: { total: candidates.length, avgSemantic, avgFinal },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════
module.exports = {
  jobRouter,
  applyRouter,
  candidatesRouter,
  candidateRouter,
  valRouter,
  analyticsRouter,
};