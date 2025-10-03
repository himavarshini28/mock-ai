import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const generateQuestion = async (level: 'easy' | 'medium' | 'hard', questionNumber: number): Promise<{
  id: string;
  text: string;
  level: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}> => {
  const timeLimits = { easy: 20, medium: 60, hard: 120 };
  
  const prompt = `
  Generate a ${level} level full-stack (React/Node.js) interview question.
  This is question ${questionNumber} of 6.
  
  Requirements:
  - Should test practical knowledge
  - Be specific and clear
  - Appropriate for ${level} level
  
  Return only the question text, no explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const questionText = response.text() || "What is React?";

    return {
      id: `q_${Date.now()}_${questionNumber}`,
      text: questionText.trim(),
      level,
      timeLimit: timeLimits[level]
    };
  } catch (error) {
    console.error('Error generating question:', error);
    return {
      id: `q_${Date.now()}_${questionNumber}`,
      text: "What is React?",
      level,
      timeLimit: timeLimits[level]
    };
  }
};

export const scoreAnswer = async (question: string, answer: string): Promise<{
  score: number;
  reasoning: string;
  breakdown: {
    technical_accuracy: number;
    clarity: number;
    completeness: number;
    depth: number;
  };
}> => {
  const prompt = `
  You are an expert technical interviewer. Score this answer comprehensively.
  
  Question: ${question}
  Answer: ${answer}
  
  Provide scoring breakdown and return JSON in this exact format:
  {
    "score": 85,
    "reasoning": "Strong technical understanding with good examples, but could explain edge cases better.",
    "breakdown": {
      "technical_accuracy": 90,
      "clarity": 85,
      "completeness": 80,
      "depth": 85
    }
  }
  
  Scoring criteria:
  - technical_accuracy (0-100): Correctness of information
  - clarity (0-100): How well explained and understandable
  - completeness (0-100): Covers all aspects of the question
  - depth (0-100): Shows deeper understanding and insights
  - score: Average of all four criteria
  - reasoning: 1-2 sentences explaining the score
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();
    
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : "{}";
    const aiResult = JSON.parse(jsonString);
    
    const breakdown = aiResult.breakdown || {
      technical_accuracy: 50,
      clarity: 50,
      completeness: 50,
      depth: 50
    };
    
    const calculatedScore = Math.round(
      (breakdown.technical_accuracy + breakdown.clarity + breakdown.completeness + breakdown.depth) / 4
    );
    
    return {
      score: Math.min(Math.max(aiResult.score || calculatedScore, 0), 100),
      reasoning: aiResult.reasoning || "Standard response provided.",
      breakdown: breakdown
    };
  } catch (error) {
    console.error('Error scoring answer:', error);
    return {
      score: 50,
      reasoning: "Unable to score due to technical issue - manual review recommended.",
      breakdown: {
        technical_accuracy: 50,
        clarity: 50,
        completeness: 50,
        depth: 50
      }
    };
  }
};

export const generateSummary = async (questions: any[]): Promise<string> => {
  const qaText = questions.map((q, i) => 
    `Q${i + 1} (${q.level}): ${q.question}\nA: ${q.answer}\nScore: ${q.aiScore}/100\n`
  ).join('\n');

  const prompt = `
  Create a concise interview summary for this candidate based on their responses:
  
  ${qaText}
  
  Provide:
  - Overall technical competency
  - Strengths observed
  - Areas for improvement
  - Recommendation (hire/consider/pass)
  
  Keep it professional and under 150 words.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Interview completed. Review individual question scores for detailed assessment.";
  } catch (error) {
    console.error('Error generating summary:', error);
    return "Interview completed. Review individual question scores for detailed assessment.";
  }
};