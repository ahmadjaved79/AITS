const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabase');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/login  ── original, untouched
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const { data: users, error } = await supabase
      .from('users').select('*').eq('email', email).limit(1);

    if (error || !users?.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({
      token: signToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth/seed  ── original, untouched
router.post('/seed', async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', 'recruiter@ahis.com').limit(1);

    if (existing?.length)
      return res.json({ message: 'Recruiter already exists' });

    const hashed = await bcrypt.hash('recruiter123', 12);
    const { error } = await supabase.from('users').insert({
      name: 'AHIS Recruiter',
      email: 'recruiter@ahis.com',
      password: hashed,
      role: 'recruiter'
    });

    if (error) throw new Error(error.message);
    res.json({ message: 'Recruiter seeded', email: 'recruiter@ahis.com', password: 'recruiter123' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── NEW ──────────────────────────────────────────────────────────────────────
// POST /api/auth/register  ── candidate self-registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Check if email already taken
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).limit(1);

    if (existing?.length)
      return res.status(409).json({ error: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const { data: inserted, error } = await supabase
      .from('users')
      .insert({ name, email, password: hashed, role: 'candidate' })
      .select('id, name, email, role')
      .single();

    if (error) throw new Error(error.message);

    res.status(201).json({
      token: signToken(inserted.id),
      user: { id: inserted.id, name: inserted.name, email: inserted.email, role: inserted.role }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// ── END NEW ──────────────────────────────────────────────────────────────────

module.exports = router;