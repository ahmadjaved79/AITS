require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { checkMLHealth } = require('./utils/mlClient');
const supabase = require('./utils/supabase');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const { jobRouter, applyRouter, candidatesRouter, candidateRouter, valRouter, analyticsRouter } = require('./controllers');
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/jobs',       jobRouter);
app.use('/api/apply',      applyRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/candidate',  candidateRouter);
app.use('/api/validation', valRouter);
app.use('/api/analytics',  analyticsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  // Test Supabase connection
  const { error } = await supabase.from('users').select('id').limit(1);
  if (error) {
    console.error('❌ Supabase connection failed:', error.message);
    process.exit(1);
  }
  console.log('✅ Supabase connected');

  // Check ML service
  const ml = await checkMLHealth();
  if (ml) console.log('✅ Python ML service connected');
  else console.warn('⚠️  ML service not running — start it with: cd ml-service && python main.py');

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

start();