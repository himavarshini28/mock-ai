import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "models/gemini-pro" }); // Try with models/ prefix

interface ExtractedField {
  value: string | null;
  confidence: number;
  source: 'ai' | 'regex' | 'manual';
}

interface ExtractedFields {
  name: ExtractedField;
  email: ExtractedField;
  phone: ExtractedField;
}

const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+/gm;

function extractWithRegex(text: string): Partial<ExtractedFields> {
  const results: Partial<ExtractedFields> = {};
  
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    results.email = {
      value: emailMatch[0],
      confidence: 0.85,
      source: 'regex'
    };
  }
  
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    results.phone = {
      value: phoneMatch[0],
      confidence: 0.80,
      source: 'regex'
    };
  }
  
  const nameMatch = text.match(nameRegex);
  if (nameMatch) {
    results.name = {
      value: nameMatch[0],
      confidence: 0.70,
      source: 'regex'
    };
  }
  
  return results;
}

export const extractFieldsAI = async (text: string): Promise<ExtractedFields> => {
  // Force an immediate console log that should definitely appear
  console.log('=====================================');
  console.log('EXTRACT FIELDS AI FUNCTION STARTED!');
  console.log('=====================================');
  
  // Try Gemini first, but with proper error handling
  try {
    console.log('🔑 API Key available:', !!process.env.GEMINI_API_KEY);
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      throw new Error('Invalid or missing GEMINI_API_KEY');
    }
    
    console.log('🤖 Attempting Gemini AI extraction...');
    const result = await model.generateContent(`
Extract information from this resume text and return ONLY a JSON object:

${text}

Return exactly this format:
{"name": {"value": "Full Name", "confidence": 0.95}, "email": {"value": "email@example.com", "confidence": 0.90}, "phone": {"value": "+1-555-123-4567", "confidence": 0.85}}
`);
    
    const response = await result.response;
    const rawText = response.text();
    console.log('✅ Gemini response received:', rawText);
    
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }
    
    const aiResults = JSON.parse(jsonMatch[0]);
    console.log('🎯 Gemini extraction successful:', aiResults);
    
    return {
      name: {
        value: aiResults.name?.value || null,
        confidence: Number(aiResults.name?.confidence) || 0,
        source: 'ai'
      },
      email: {
        value: aiResults.email?.value || null,
        confidence: Number(aiResults.email?.confidence) || 0,
        source: 'ai'
      },
      phone: {
        value: aiResults.phone?.value || null,
        confidence: Number(aiResults.phone?.confidence) || 0,
        source: 'ai'
      }
    };
    
  } catch (error: any) {
    console.error('❌ Gemini AI extraction failed:', error.message || error);
    console.log('🔄 Using regex extraction as fallback...');
  }
  
  // Regex fallback
  const regexResults = extractWithRegex(text);
  console.log('📝 Regex extraction results:', regexResults);
  
  return {
    name: regexResults.name || { value: null, confidence: 0, source: 'regex' },
    email: regexResults.email || { value: null, confidence: 0, source: 'regex' },
    phone: regexResults.phone || { value: null, confidence: 0, source: 'regex' }
  };
};