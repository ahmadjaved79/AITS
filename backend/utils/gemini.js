const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use a stable 2026 model string
const MODEL_NAME = 'gemini-1.5-flash'; 

function getModel() {
  return genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: { responseMimeType: "application/json" } 
  });
}

/**
 * Analyze resume against job description
 */
async function analyzeResume(resumeText, jobDescription, requiredSkills) {
  const model = getModel();
  const prompt = `Analyze this resume against the JD. 
  JD: ${jobDescription}
  Skills: ${requiredSkills.join(', ')}
  Resume: ${resumeText.slice(0, 3000)}
  Return JSON: { "extractedSkills": [], "semanticScore": 0, "missingSkills": [], "shortSummary": "" }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    console.error('[analyzeResume error]', err.message);
    return {
      extractedSkills: [],
      semanticScore: 0,
      missingSkills: requiredSkills,
      shortSummary: 'Analysis unavailable.'
    };
  }
} // <--- Check this brace

/**
 * Generate 5 MCQ validation questions
 */
async function generateValidationQuestions(jobTitle, jobDescription, skills) {
  const model = getModel();
  const prompt = `Generate 5 MCQ questions for a ${jobTitle} role testing: ${skills.join(', ')}.
  Return JSON array: [{ "question": "", "options": [], "correctIndex": 0 }]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    console.error('[generateValidationQuestions error]', err.message);
    // Fallback questions if API fails
    return [
      { question: `What is a key concept in ${jobTitle}?`, options: ['A', 'B', 'C', 'D'], correctIndex: 0 }
    ];
  }
} // <--- Check this brace

// This line will now work because both functions are defined above it
module.exports = { analyzeResume, generateValidationQuestions };