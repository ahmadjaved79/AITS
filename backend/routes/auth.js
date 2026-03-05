// ============================================================
// routes/auth.js
// ============================================================
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth/seed  (creates default recruiter account)
router.post('/seed', async (req, res) => {
  try {
    const exists = await User.findOne({ email: 'recruiter@ahis.com' });
    if (exists) return res.json({ message: 'Recruiter already exists' });
    await User.create({ name: 'AHIS Recruiter', email: 'recruiter@ahis.com', password: 'recruiter123', role: 'recruiter' });
    res.json({ message: 'Recruiter seeded', email: 'recruiter@ahis.com', password: 'recruiter123' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

// ============================================================
// routes/jobs.js  — save as separate file: routes/jobs.js
// ============================================================
// const router2 = require('express').Router();
// const { protect, recruiterOnly } = require('../middleware/auth');
// const { Job } = require('../models');
// POST /api/jobs/create
// GET  /api/jobs
// GET  /api/jobs/:id
// (see controllers below — inline for brevity)

// ============================================================
// routes/apply.js  — POST /api/apply
// routes/candidates.js — GET /api/candidates/:jobId
// routes/candidate.js  — GET /api/candidate/:id
// routes/validation.js — POST generate + submit
// routes/analytics.js  — GET /api/analytics/:jobId
// ============================================================
// All implemented in controllers/index.js below