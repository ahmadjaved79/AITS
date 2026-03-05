const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // Ensure your env file is loaded

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
  const models = await genAI.listModels();
  console.log("Available models:");
  models.models.forEach(m => console.log(m.name));
}

checkModels();