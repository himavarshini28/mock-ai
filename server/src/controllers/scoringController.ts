import { Request, Response } from "express";
import { interview } from "../models/interview";
import { candidate } from "../models/candidate";
import { generateQuestion, scoreAnswer, generateSummary } from "../utils/aiHelpers";

interface ScoreAnswerRequest extends Request {
  body: {
    interviewId: string;
    questionIndex: number;
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }
}

interface CompleteInterviewRequest extends Request {
  body: {
    interviewId: string;
    finalScore: number;
  }
}

export const scoreAnswerEndpoint = async (req: ScoreAnswerRequest, res: Response): Promise<void> => {
  try {
    const { interviewId, questionIndex, question, answer, difficulty } = req.body;

    // Validate input
    if (!interviewId || typeof questionIndex !== 'number' || !question || !answer) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Missing required fields: interviewId, questionIndex, question, answer',
        statusCode: 400
      });
      return;
    }

    // Find the interview
    const interviewRecord = await interview.findById(interviewId);
    if (!interviewRecord) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Interview not found',
        statusCode: 404
      });
      return;
    }

    // Score the answer using AI
    let score = 75; // Default score
    
    try {
      const scoreResult = await scoreAnswer(question, answer);
      score = scoreResult.score || 75;
      console.log(`AI scored answer: ${score} for question: ${question.substring(0, 50)}...`);
    } catch (aiError) {
      console.error('AI scoring failed, using fallback scoring:', aiError);
      
      // Fallback scoring based on answer length and keywords
      const answerLength = answer.trim().length;
      const hasKeywords = /\b(experience|project|challenge|solution|technology|javascript|react|node|database|api|frontend|backend|fullstack)\b/i.test(answer);
      
      if (answerLength < 20) {
        score = Math.floor(Math.random() * 20) + 30; // 30-50 for very short answers
      } else if (answerLength < 100) {
        score = Math.floor(Math.random() * 25) + 55; // 55-80 for short answers
      } else if (hasKeywords && answerLength > 100) {
        score = Math.floor(Math.random() * 20) + 75; // 75-95 for good answers
      } else {
        score = Math.floor(Math.random() * 25) + 65; // 65-90 for medium answers
      }
    }

    // Ensure score is within valid range
    score = Math.max(0, Math.min(100, score));

    // Update interview record
    const questionData = {
      questionIndex,
      question,
      answer,
      score,
      difficulty,
      timestamp: new Date()
    };

    await interview.findByIdAndUpdate(
      interviewId,
      { 
        $push: { questions: questionData },
        $set: { 
          status: questionIndex >= 5 ? 'completed' : 'in-progress',
          updatedAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      score,
      message: 'Answer scored successfully'
    });

  } catch (error) {
    console.error('Error scoring answer:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to score answer',
      statusCode: 500
    });
  }
};

export const completeInterviewEndpoint = async (req: CompleteInterviewRequest, res: Response): Promise<void> => {
  try {
    const { interviewId, finalScore } = req.body;

    if (!interviewId || typeof finalScore !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Missing required fields: interviewId, finalScore',
        statusCode: 400
      });
      return;
    }

    // Find and update interview
    const interviewRecord = await interview.findById(interviewId).populate('candidateId');
    if (!interviewRecord) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Interview not found',
        statusCode: 404
      });
      return;
    }

    // Generate AI summary
    let aiSummary = `Interview completed with a score of ${finalScore}/100.`;
    try {
      const answers = interviewRecord.questions?.map((q: any) => q.answer) || [];
      if (answers.length > 0) {
        aiSummary = await generateSummary(answers);
      }
    } catch (error) {
      console.error('AI summary generation failed:', error);
    }

    // Update interview status
    await interview.findByIdAndUpdate(interviewId, {
      status: 'completed',
      finalScore,
      summary: aiSummary,
      completedAt: new Date(),
      updatedAt: new Date()
    });

    // Update candidate record
    await candidate.findByIdAndUpdate(interviewRecord.candidateId, {
      interviewStatus: 'completed',
      score: finalScore,
      summary: aiSummary,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Interview completed successfully',
      finalScore,
      summary: aiSummary
    });

  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to complete interview',
      statusCode: 500
    });
  }
};