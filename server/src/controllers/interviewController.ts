import { Request, Response } from "express";
import { interview } from "../models/interview";
import { candidate } from "../models/candidate";
import { 
  SubmitAnswerRequest, 
  submitAnswerResponse, 
  completeInterviewRequest,
  completeInterviewResponse,
  ErrorResponse 
} from "../types/api";
import { generateQuestion, scoreAnswer, generateSummary } from "../utils/aiHelpers";

export const startInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: candidateId } = req.params;

    const candidateData = await candidate.findById(candidateId);
    if (!candidateData) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Candidate not found',
        statusCode: 404
      });
      return;
    }

    let interviewData = await interview.findOne({ candidateId });
    
    if (!interviewData) {
      interviewData = new interview({
        candidateId,
        questions: [],
        status: 'in-progress',
        finalScore: 0,
        summary: '',
        startDate: new Date()
      });
      await interviewData.save();
    }

    const firstQuestion = await generateQuestion('easy', 1);
    
    res.status(200).json({
      success: true,
      data: {
        interviewId: interviewData._id,
        question: firstQuestion,
        questionNumber: 1,
        totalQuestions: 6
      }
    });

  } catch (error) {
    console.error('Error starting interview:', error);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to start interview',
      statusCode: 500
    };
    
    res.status(500).json(errorResponse);
  }
};

export const submitAnswer = async (req: Request, res: Response<submitAnswerResponse | ErrorResponse>): Promise<void> => {
  try {
    const { id: interviewId } = req.params;
    const { questionId, answer, timeTaken } = req.body as SubmitAnswerRequest;

    const interviewData = await interview.findById(interviewId);
    if (!interviewData) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Interview not found',
        statusCode: 404
      });
      return;
    }

    const currentQuestionIndex = interviewData.questions.length;
    const questionText = `Question ${currentQuestionIndex + 1}`;
    const scoringResult = await scoreAnswer(questionText, answer);
    const feedback = `Your answer scored ${scoringResult.score}/100. ${scoringResult.reasoning}`;

    interviewData.questions.push({
      question: questionText,
      answer,
      level: currentQuestionIndex < 2 ? 'easy' : currentQuestionIndex < 4 ? 'medium' : 'hard',
      aiScore: scoringResult.score,
      timeTaken,
      reasoning: scoringResult.reasoning,
      breakdown: scoringResult.breakdown
    });

    await interviewData.save();

    const isComplete = interviewData.questions.length >= 6;
    
    let nextQuestion = undefined;
    if (!isComplete) {
      const nextLevel = currentQuestionIndex + 1 < 2 ? 'easy' : 
                      currentQuestionIndex + 1 < 4 ? 'medium' : 'hard';
      nextQuestion = await generateQuestion(nextLevel, currentQuestionIndex + 2);
    }

    const response: submitAnswerResponse = {
      success: true,
      score: scoringResult.score,
      feedback,
      nextQuestion,
      isInterviewComplete: isComplete
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error submitting answer:', error);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to submit answer',
      statusCode: 500
    };
    
    res.status(500).json(errorResponse);
  }
};

export const completeInterview = async (req: Request, res: Response<completeInterviewResponse | ErrorResponse>): Promise<void> => {
  try {
    const { id: interviewId } = req.params;

    const interviewData = await interview.findById(interviewId);
    if (!interviewData) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Interview not found',
        statusCode: 404
      });
      return;
    }

    const totalScore = interviewData.questions.reduce((sum, q) => sum + q.aiScore, 0);
    const finalScore = Math.round(totalScore / interviewData.questions.length);

    const summary = await generateSummary(interviewData.questions);

    interviewData.finalScore = finalScore;
    interviewData.summary = summary;
    interviewData.status = 'completed';
    interviewData.endDate = new Date();
    await interviewData.save();

    await candidate.findByIdAndUpdate(interviewData.candidateId, {
      score: finalScore,
      summary,
      interviewStatus: 'completed'
    });

    const response: completeInterviewResponse = {
      success: true,
      data: {
        finalScore,
        summary,
        interview: interviewData
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error completing interview:', error);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to complete interview',
      statusCode: 500
    };
    
    res.status(500).json(errorResponse);
  }
};