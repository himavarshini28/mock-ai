import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log('=== Testing Gemini API ===');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');

const testGemini = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // Try different model names
    const modelNames = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Extract information from this resume and return JSON:
        
        John Smith
        Senior Software Engineer
        Email: john.smith@email.com
        Phone: +1-555-123-4567
        
        Return only JSON: {"name": "John Smith", "email": "john.smith@email.com", "phone": "+1-555-123-4567"}`;

        console.log('Sending request to Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName} worked! Response:`, text);
        return; // Exit on first success
        
      } catch (modelError: any) {
        console.log(`❌ ${modelName} failed:`, modelError.message);
      }
    }
    
    console.log('❌ All models failed');
    
  } catch (error) {
    console.error('Gemini API test failed:', error);
  }
};

testGemini();