import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
  const regexFallback = extractWithRegex(text);
  
  const prompt = `
  You are an expert resume parser. Extract the candidate's information with confidence scores.
  
  Extract and return JSON in this exact format:
  {
    "name": {"value": "Full Name", "confidence": 0.95},
    "email": {"value": "email@example.com", "confidence": 0.98},
    "phone": {"value": "+1-555-123-4567", "confidence": 0.90}
  }
  
  Rules:
  - confidence: 0.0-1.0 based on how certain you are
  - value: null if not found or uncertain
  - Look for patterns: name at top, email with @, phone with digits/dashes
  
  Resume text:
  ${text}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();
    
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : "{}";
    const aiResults = JSON.parse(jsonString);
    
    const extractedFields: ExtractedFields = {
      name: {
        value: null,
        confidence: 0,
        source: 'ai'
      },
      email: {
        value: null,
        confidence: 0,
        source: 'ai'
      },
      phone: {
        value: null,
        confidence: 0,
        source: 'ai'
      }
    };
    
    Object.keys(extractedFields).forEach(key => {
      const aiField = aiResults[key];
      const regexField = regexFallback[key as keyof ExtractedFields];
      
      if (aiField && aiField.value && aiField.confidence > 0.5) {
        extractedFields[key as keyof ExtractedFields] = {
          value: aiField.value,
          confidence: Math.min(aiField.confidence, 0.98),
          source: 'ai'
        };
      } else if (regexField && regexField.value) {
        extractedFields[key as keyof ExtractedFields] = regexField;
      } else {
        extractedFields[key as keyof ExtractedFields] = {
          value: null,
          confidence: 0,
          source: 'ai'
        };
      }
    });
    
    return extractedFields;
    
  } catch (error) {
    console.error('AI extraction failed, using regex fallback:', error);
    
    return {
      name: regexFallback.name || { value: null, confidence: 0, source: 'regex' },
      email: regexFallback.email || { value: null, confidence: 0, source: 'regex' },
      phone: regexFallback.phone || { value: null, confidence: 0, source: 'regex' }
    };
  }
};