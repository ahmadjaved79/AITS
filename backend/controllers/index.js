/**
 * AHIS - All Route Controllers
 * Each section below corresponds to its own route file.
 * Copy each section into the matching routes/ file.
 */

// ============================================================
// routes/jobs.js
// ============================================================
const jobRouter = require('express').Router();
const { protect, recruiterOnly } = require('../middleware/auth');
const { Job } = require('../models');

jobRouter.post('/create', protect, recruiterOnly, async (req, res) => {
  try {
    const { title, description, requiredSkills, weights } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description required' });
    const job = await Job.create({
      title, description,
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills.split(',').map(s => s.trim()),
      weights: weights || { semantic: 0.6, impact: 0.2, validation: 0.2 },
      createdBy: req.user._id,
    });
    res.status(201).json(job);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

jobRouter.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

jobRouter.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports.jobRouter = jobRouter;

// ============================================================
// routes/apply.js
// ============================================================
const applyRouter = require('express').Router();
const upload = require('../middleware/upload');
const { extractTextFromFile } = require('../utils/extractText');
const { analyzeResume } = require('../utils/gemini');
const { Candidate, Job: JobModel } = require('../models');
const fs = require('fs');

applyRouter.post('/', upload.single('resume'), async (req, res) => {
  const filePath = req.file?.path;
  try {
    const { name, email, jobId } = req.body;
    if (!name || !email || !jobId) return res.status(400).json({ error: 'name, email, jobId required' });
    if (!req.file) return res.status(400).json({ error: 'Resume file required' });

    const job = await JobModel.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Check duplicate
    const existing = await Candidate.findOne({ email, jobId });
    if (existing) return res.status(409).json({ error: 'Already applied to this job' });

    // Extract text
    const resumeText = await extractTextFromFile(filePath);
    if (!resumeText?.trim()) return res.status(400).json({ error: 'Could not extract text from resume' });

    // AI Analysis
    const analysis = await analyzeResume(resumeText, job.description, job.requiredSkills);

    // Save candidate
    const candidate = new Candidate({
      name, email, jobId,
      resumeText,
      extractedSkills: analysis.extractedSkills || [],
      semanticScore: analysis.semanticScore || 0,
      missingSkills: analysis.missingSkills || [],
      summary: analysis.shortSummary || '',
      status: 'processed',
    });

    await candidate.recalcFinalScore();
    await candidate.save();

    // Clean up file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(201).json({
      message: 'Application submitted successfully',
      candidateId: candidate._id,
      semanticScore: candidate.semanticScore,
      missingSkills: candidate.missingSkills,
      summary: candidate.summary,
    });
  } catch (e) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('[APPLY ERROR]', e.message);
    res.status(500).json({ error: e.message });
  }
 
});

module.exports.applyRouter = applyRouter;

// ============================================================
// routes/candidates.js — GET /api/candidates/:jobId
// ============================================================
  const candidatesRouter = require('express').Router();
  const { Candidate: CandModel } = require('../models');

  candidatesRouter.get('/:jobId', protect, recruiterOnly, async (req, res) => {
    try {
      const candidates = await CandModel
        .find({ jobId: req.params.jobId })
        .sort({ finalScore: -1 });
      res.json(candidates);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  module.exports.candidatesRouter = candidatesRouter;

// ============================================================
// routes/candidate.js — GET /api/candidate/:id
// ============================================================
const candidateRouter = require('express').Router();
const { Candidate: CandDetail, Validation: ValModel } = require('../models');

candidateRouter.get('/:id', protect, recruiterOnly, async (req, res) => {
  try {
    const c = await CandDetail.findById(req.params.id).populate('jobId', 'title requiredSkills weights');
    if (!c) return res.status(404).json({ error: 'Candidate not found' });
    const validation = await ValModel.findOne({ candidateId: c._id });
    res.json({ candidate: c, validation });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports.candidateRouter = candidateRouter;

// ============================================================
// routes/validation.js
// ============================================================
const valRouter = require('express').Router();
const { generateValidationQuestions } = require('../utils/gemini');
const { Candidate: CandVal, Job: JobVal, Validation } = require('../models');

// POST /api/validation/generate/:candidateId
valRouter.post('/generate/:candidateId', protect, recruiterOnly, async (req, res) => {
  try {
    const cand = await CandVal.findById(req.params.candidateId);
    if (!cand) return res.status(404).json({ error: 'Candidate not found' });
    const job = await JobVal.findById(cand.jobId);

    const rawQs = await generateValidationQuestions(job.title, job.description, job.requiredSkills);

    const validation = await Validation.create({
      candidateId: cand._id,
      jobId: job._id,
      questions: rawQs, // stored WITH correctIndex
    });

    cand.status = 'invited';
    await cand.save();

    // Return questions WITHOUT correct answers to frontend
    const safeQs = rawQs.map(({ question, options }) => ({ question, options }));
    res.json({ validationId: validation._id, questions: safeQs });
  } catch (e) {
    console.error('[GENERATE ERROR]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/validation/submit
valRouter.post('/submit', async (req, res) => {
  try {
    const { validationId, answers } = req.body;
    const validation = await Validation.findById(validationId);
    if (!validation) return res.status(404).json({ error: 'Validation not found' });
    if (validation.submitted) return res.status(400).json({ error: 'Already submitted' });

    // ✅ Fixed: use correctIndex not correct
    let correct = 0;
    validation.questions.forEach((q, i) => {
      if (answers[i] !== undefined && Number(answers[i]) === Number(q.correctIndex)) {
        correct++;
      }
    });

    const score = Math.round((correct / validation.questions.length) * 100);

    validation.answers = answers;
    validation.score = score;
    validation.submitted = true;
    await validation.save();

    // Update candidate scores
    const cand = await CandVal.findById(validation.candidateId);
    cand.validationScore = score;
    cand.status = 'validated';
    await cand.recalcFinalScore();
    await cand.save();

    res.json({
      score,
      correct,
      total: validation.questions.length,
      finalScore: cand.finalScore,
    });
  } catch (e) {
    console.error('[SUBMIT ERROR]', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports.valRouter = valRouter;
// ============================================================
// routes/analytics.js — GET /api/analytics/:jobId
// ============================================================
const analyticsRouter = require('express').Router();
const { Candidate: CandA } = require('../models');

analyticsRouter.get('/:jobId', protect, recruiterOnly, async (req, res) => {
  try {
    const candidates = await CandA.find({ jobId: req.params.jobId }).sort({ finalScore: -1 }).limit(20);

    // Skill distribution
    const skillMap = {};
    candidates.forEach(c => {
      c.extractedSkills.forEach(s => { skillMap[s] = (skillMap[s] || 0) + 1; });
    });

    const avgSemantic = candidates.length
      ? (candidates.reduce((a, c) => a + c.semanticScore, 0) / candidates.length).toFixed(1)
      : 0;
    const avgFinal = candidates.length
      ? (candidates.reduce((a, c) => a + c.finalScore, 0) / candidates.length).toFixed(1)
      : 0;

    res.json({
      topCandidates: candidates.slice(0, 10).map((c, i) => ({
        rank: i + 1, name: c.name, semanticScore: c.semanticScore,
        validationScore: c.validationScore, finalScore: c.finalScore,
      })),
      skillDistribution: Object.entries(skillMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([skill, count]) => ({ skill, count })),
      metrics: { total: candidates.length, avgSemantic, avgFinal },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports.analyticsRouter = analyticsRouter;