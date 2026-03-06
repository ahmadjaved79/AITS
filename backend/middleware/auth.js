const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: users, error } = await supabase
      .from('users').select('id, name, email, role').eq('id', decoded.id).limit(1);

    if (error || !users?.length)
      return res.status(401).json({ error: 'User not found' });

    req.user = users[0];
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const recruiterOnly = (req, res, next) => {
  if (req.user?.role !== 'recruiter')
    return res.status(403).json({ error: 'Recruiter access required' });
  next();
};

module.exports = { protect, recruiterOnly };