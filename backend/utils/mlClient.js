/**
 * ML Service Client
 * Calls the Python FastAPI ML service for all AI operations.
 * Replaces gemini.js completely.
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Analyze resume file against job details
 * Sends file directly to Python ML service
 */
async function analyzeResumeFile(filePath, jobTitle, jobDescription, requiredSkills) {
  try {
    const form = new FormData();
    form.append('resume', fs.createReadStream(filePath));
    form.append('job_title', jobTitle);
    form.append('job_description', jobDescription);
    form.append('required_skills', requiredSkills.join(','));

    const response = await axios.post(`${ML_URL}/ml/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 60000, // 60s timeout for ML processing
    });

    return response.data;
  } catch (err) {
    const msg = err.response?.data?.detail || err.message;
    console.error('[mlClient.analyzeResumeFile]', msg);
    throw new Error(`ML analysis failed: ${msg}`);
  }
}

/**
 * Generate MCQ validation questions
 */
async function generateValidationQuestions(jobTitle, requiredSkills) {
  try {
    const response = await axios.post(`${ML_URL}/ml/generate-questions`, {
      jobTitle,
      requiredSkills,
    }, { timeout: 30000 });

    return response.data.questions;
  } catch (err) {
    const msg = err.response?.data?.detail || err.message;
    console.error('[mlClient.generateValidationQuestions]', msg);
    throw new Error(`Question generation failed: ${msg}`);
  }
}

/**
 * Health check — verify ML service is running
 */
async function checkMLHealth() {
  try {
    const res = await axios.get(`${ML_URL}/health`, { timeout: 5000 });
    return res.data;
  } catch {
    return null;
  }
}

module.exports = { analyzeResumeFile, generateValidationQuestions, checkMLHealth };