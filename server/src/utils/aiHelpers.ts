import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Fallback questions when AI fails
const fallbackQuestions = {
  easy: [
    "What is React and what are its main benefits?",
    "Explain the difference between let, const, and var in JavaScript.",
    "What is the purpose of the useState hook in React?",
    "What is the difference between == and === in JavaScript?",
    "What is a component in React?",
    "Explain what props are in React."
  ],
  medium: [
    "Explain the concept of lifting state up in React.",
    "What is the difference between controlled and uncontrolled components?",
    "How does the useEffect hook work and when would you use it?",
    "What is the difference between synchronous and asynchronous JavaScript?",
    "Explain how promises work in JavaScript.",
    "What is the virtual DOM and how does it improve performance?"
  ],
  hard: [
    "Explain how React's reconciliation algorithm works.",
    "What are some common performance optimization techniques in React?",
    "How would you implement authentication in a full-stack application?",
    "Explain the concept of closures in JavaScript with an example.",
    "What is the difference between useMemo and useCallback hooks?",
    "How would you handle state management in a large React application?"
  ]
};

export const generateQuestion = async (level: 'easy' | 'medium' | 'hard', questionNumber: number): Promise<{
  id: string;
  text: string;
  level: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}> => {
  const timeLimits = { easy: 120, medium: 180, hard: 240 };
  
  // Check if we have a valid API key
  if (!process.env.GEMINI_API_KEY || 
      process.env.GEMINI_API_KEY === 'your-gemini-api-key-here' || 
      process.env.GEMINI_API_KEY === 'AIzaSyDUjzvSol9aS3DLEx1aQoF9iWMred5Hbrg') {
    console.log('Using fallback questions - AI service not available');
    const questions = fallbackQuestions[level];
    const questionIndex = (questionNumber - 1) % questions.length;
    return {
      id: `q_${Date.now()}_${questionNumber}`,
      text: questions[questionIndex],
      level,
      timeLimit: timeLimits[level]
    };
  }

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
    const questionText = response.text() || fallbackQuestions[level][0];

    return {
      id: `q_${Date.now()}_${questionNumber}`,
      text: questionText.trim(),
      level,
      timeLimit: timeLimits[level]
    };
  } catch (error: any) {
    console.error('Error generating question with AI, using fallback:', error?.message || error);
    const questions = fallbackQuestions[level];
    const questionIndex = (questionNumber - 1) % questions.length;
    return {
      id: `q_${Date.now()}_${questionNumber}`,
      text: questions[questionIndex],
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
  // Provide fallback scoring if AI is not available
  if (!process.env.GEMINI_API_KEY || 
      process.env.GEMINI_API_KEY === 'your-gemini-api-key-here' || 
      process.env.GEMINI_API_KEY === 'AIzaSyDUjzvSol9aS3DLEx1aQoF9iWMred5Hbrg') {
    
    console.log('Using fallback scoring - AI service not available');
    
    // Simple scoring based on answer length and keywords
    const answerLength = answer.trim().length;
    const hasCodeExample = /```|function|const|let|=>/.test(answer);
    const hasExplanation = answerLength > 50;
    
    let baseScore = 60; // Start with a base score
    if (hasCodeExample) baseScore += 15;
    if (hasExplanation) baseScore += 15;
    if (answerLength > 100) baseScore += 10;
    
    baseScore = Math.min(baseScore, 95); // Cap at 95 to avoid perfect scores
    
    return {
      score: baseScore,
      reasoning: "Automated scoring based on response structure and content analysis.",
      breakdown: {
        technical_accuracy: baseScore,
        clarity: baseScore - 5,
        completeness: baseScore - 10,
        depth: baseScore - 5
      }
    };
  }

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
  } catch (error: any) {
    console.error('Error scoring answer with AI, using fallback:', error?.message || error);
    
    // Fallback scoring
    const answerLength = answer.trim().length;
    const baseScore = Math.min(50 + Math.floor(answerLength / 10), 80);
    
    return {
      score: baseScore,
      reasoning: "Fallback scoring applied due to technical issue.",
      breakdown: {
        technical_accuracy: baseScore,
        clarity: baseScore - 5,
        completeness: baseScore - 10,
        depth: baseScore - 5
      }
    };
  }
};

export const generateSummary = async (questions: any[]): Promise<string> => {
  const qaText = questions.map((q, i) => 
    `Q${i + 1} (${q.level}): ${q.question}\nA: ${q.answer}\nScore: ${q.aiScore}/100\n`
  ).join('\n');

  // Provide fallback summary if AI is not available
  if (!process.env.GEMINI_API_KEY || 
      process.env.GEMINI_API_KEY === 'your-gemini-api-key-here' || 
      process.env.GEMINI_API_KEY === 'AIzaSyDUjzvSol9aS3DLEx1aQoF9iWMred5Hbrg') {
    
    const averageScore = questions.reduce((sum, q) => sum + (q.aiScore || 0), 0) / questions.length;
    const completedQuestions = questions.filter(q => q.answer && q.answer.trim().length > 0).length;
    
    let recommendation = "Consider";
    if (averageScore >= 80) recommendation = "Hire";
    else if (averageScore < 60) recommendation = "Pass";
    
    return `Interview Summary:
Completed ${completedQuestions} of ${questions.length} questions with an average score of ${Math.round(averageScore)}/100.

The candidate demonstrated ${averageScore >= 70 ? 'good' : averageScore >= 50 ? 'adequate' : 'limited'} technical knowledge across the topics covered. Areas of strength include their responses to the questions they answered completely.

Recommendation: ${recommendation}`;
  }

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
  } catch (error: any) {
    console.error('Error generating summary with AI, using fallback:', error?.message || error);
    
    const averageScore = questions.reduce((sum, q) => sum + (q.aiScore || 0), 0) / questions.length;
    return `Interview completed with an average score of ${Math.round(averageScore)}/100. Review individual question scores for detailed assessment.`;
  }
};