// ============================================================
// models/User.js
// ============================================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['recruiter', 'candidate'], default: 'candidate' },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);

// ============================================================
// models/Job.js
// ============================================================
// const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  description:    { type: String, required: true },
  requiredSkills: [{ type: String }],
  weights: {
    semantic:   { type: Number, default: 0.6 },
    impact:     { type: Number, default: 0.2 },
    validation: { type: Number, default: 0.2 },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// module.exports = mongoose.model('Job', JobSchema);

// ============================================================
// models/Candidate.js
// ============================================================
const CandidateSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  email:           { type: String, required: true },
  jobId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  resumeText:      { type: String },
  extractedSkills: [{ type: String }],
  semanticScore:   { type: Number, default: 0 },
  validationScore: { type: Number, default: 0 },
  finalScore:      { type: Number, default: 0 },
  missingSkills:   [{ type: String }],
  summary:         { type: String },
  status: {
    type: String,
    enum: ['pending', 'processed', 'invited', 'validated'],
    default: 'pending',
  },
}, { timestamps: true });

// Auto-calc finalScore before save
CandidateSchema.methods.recalcFinalScore = async function() {
  const Job = mongoose.model('Job');
  const job = await Job.findById(this.jobId);
  if (!job) return;
  const w = job.weights;
  this.finalScore = parseFloat(
    ((this.semanticScore * w.semantic) + (this.validationScore * w.validation)).toFixed(2)
  );
};

// module.exports = mongoose.model('Candidate', CandidateSchema);

// ============================================================
// models/Validation.js
// ============================================================
const QuestionSchema = new mongoose.Schema({
  question: String,
  options:  [String],
  correct:  Number, // index of correct option
});

const ValidationSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  jobId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  questions:   [QuestionSchema],
  answers:     [{ type: Number }], // candidate's chosen indices
  score:       { type: Number, default: 0 },
  submitted:   { type: Boolean, default: false },
}, { timestamps: true });

// ============================================================
// Export all from one place (models/index.js pattern)
// Create separate files OR use this combined export trick:
// ============================================================
module.exports = {
  User:       mongoose.model('User',       UserSchema),
  Job:        mongoose.model('Job',        JobSchema),
  Candidate:  mongoose.model('Candidate',  CandidateSchema),
  Validation: mongoose.model('Validation', ValidationSchema),
};