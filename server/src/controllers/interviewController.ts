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

export const getInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const interviews = await interview.find()
      .populate('candidateId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      interviews
    });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch interviews',
      statusCode: 500
    };
    
    res.status(500).json(errorResponse);
  }
};

export const getInterviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const interviewData = await interview.findById(id)
      .populate('candidateId', 'name email phone');

    if (!interviewData) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Interview not found',
        statusCode: 404
      });
      return;
    }

    res.status(200).json({
      success: true,
      interview: interviewData
    });

  } catch (error) {
    console.error('Error fetching interview:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch interview',
      statusCode: 500
    });
  }
};

export const createInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { candidateId, jobPosition, experienceLevel, techStack } = req.body;

    // Check if candidate exists
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

    // Check if interview already exists for this candidate
    const existingInterview = await interview.findOne({ candidateId });
    if (existingInterview) {
      res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Interview already exists for this candidate',
        statusCode: 409
      });
      return;
    }

    const newInterview = new interview({
      candidateId,
      jobPosition: jobPosition || 'Software Developer',
      experienceLevel: experienceLevel || 'Mid-level',
      techStack: techStack || ['JavaScript', 'React'],
      questions: [],
      status: 'pending',
      finalScore: 0,
      summary: ''
    });

    await newInterview.save();

    // Update candidate status
    await candidate.findByIdAndUpdate(candidateId, {
      interviewStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      interview: newInterview
    });

  } catch (error) {
    console.error('Error creating interview:', error);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to create interview',
      statusCode: 500
    };
    
    res.status(500).json(errorResponse);
  }
};

export const startInterview = async (req: Request, res: Response): Promise<void> => {
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

    // Update interview status to in-progress if it's not already
    if (interviewData.status === 'pending' || interviewData.status === 'not-started') {
      interviewData.status = 'in-progress';
      if (!interviewData.startDate) {
        interviewData.startDate = new Date();
      }
      
      // Generate and store the first question if no questions exist
      if (interviewData.questions.length === 0) {
        const firstQuestion = await generateQuestion('easy', 1);
        interviewData.questions.push({
          question: firstQuestion.text,
          answer: '',
          level: 'easy',
          aiScore: 0,
          timeTaken: 0,
          reasoning: '',
          breakdown: {
            technical_accuracy: 0,
            clarity: 0,
            completeness: 0,
            depth: 0
          }
        });
      }
      
      await interviewData.save();
    }

    // Get the current question (first unanswered question)
    const currentQuestionIndex = interviewData.questions.findIndex(q => !q.answer);
    const questionIndex = currentQuestionIndex === -1 ? 0 : currentQuestionIndex;
    
    let currentQuestion;
    if (questionIndex < interviewData.questions.length) {
      // Use existing question
      const storedQuestion = interviewData.questions[questionIndex];
      currentQuestion = {
        id: `q_${Date.now()}_${questionIndex + 1}`,
        text: storedQuestion.question,
        level: storedQuestion.level,
        timeLimit: storedQuestion.level === 'easy' ? 120 : storedQuestion.level === 'medium' ? 180 : 240
      };
    } else {
      // Generate new question
      const difficulty = questionIndex < 2 ? 'easy' : questionIndex < 4 ? 'medium' : 'hard';
      currentQuestion = await generateQuestion(difficulty, questionIndex + 1);
    }
    
    res.status(200).json({
      success: true,
      data: {
        interviewId: interviewData._id,
        question: currentQuestion,
        questionNumber: questionIndex + 1,
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
    const { questionIndex, answer } = req.body;

    if (!interviewId || questionIndex === undefined || !answer) {
      res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Interview ID, question index, and answer are required',
        statusCode: 400
      });
      return;
    }

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

    // Validate question index
    if (questionIndex < 0 || questionIndex >= 6) {
      res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Invalid question index',
        statusCode: 400
      });
      return;
    }

    // Get the question text based on index
    const difficulty = questionIndex < 2 ? 'easy' : questionIndex < 4 ? 'medium' : 'hard';
    
    let questionText: string;
    
    // Check if question already exists in the interview
    if (interviewData.questions.length > questionIndex && interviewData.questions[questionIndex].question) {
      questionText = interviewData.questions[questionIndex].question;
    } else {
      // Generate new question if it doesn't exist
      const questionObj = await generateQuestion(difficulty, questionIndex + 1);
      questionText = questionObj.text;
    }
    
    // Score the answer
    const scoringResult = await scoreAnswer(questionText, answer);

    // Update or add the question to the interview
    if (interviewData.questions.length > questionIndex) {
      // Update existing question
      interviewData.questions[questionIndex] = {
        question: questionText,
        answer,
        level: difficulty,
        aiScore: scoringResult.score,
        timeTaken: 0, // Default value if not provided
        reasoning: scoringResult.reasoning,
        breakdown: scoringResult.breakdown
      };
    } else {
      // Add new question
      interviewData.questions.push({
        question: questionText,
        answer,
        level: difficulty,
        aiScore: scoringResult.score,
        timeTaken: 0, // Default value if not provided
        reasoning: scoringResult.reasoning,
        breakdown: scoringResult.breakdown
      });
    }

    await interviewData.save();

    // Generate next question if not the last one
    let nextQuestion: { id: string; text: string; level: "easy" | "medium" | "hard"; timeLimit: number } | null = null;
    const isLastQuestion = questionIndex >= 5; // 0-based index, so 5 is the 6th question
    
    if (!isLastQuestion) {
      const nextDifficulty = (questionIndex + 1) < 2 ? 'easy' : (questionIndex + 1) < 4 ? 'medium' : 'hard';
      
      // Check if next question already exists
      if (interviewData.questions.length > questionIndex + 1 && interviewData.questions[questionIndex + 1].question) {
        // Use existing question
        const existingQuestion = interviewData.questions[questionIndex + 1];
        nextQuestion = {
          id: `q_${Date.now()}_${questionIndex + 2}`,
          text: existingQuestion.question,
          level: existingQuestion.level,
          timeLimit: nextDifficulty === 'easy' ? 120 : nextDifficulty === 'medium' ? 180 : 240
        };
      } else {
        // Generate new question
        nextQuestion = await generateQuestion(nextDifficulty, questionIndex + 2);
        
        // Pre-store the next question to avoid regeneration
        if (interviewData.questions.length <= questionIndex + 1) {
          interviewData.questions.push({
            question: nextQuestion.text,
            answer: '',
            level: nextDifficulty,
            aiScore: 0,
            timeTaken: 0,
            reasoning: '',
            breakdown: {
              technical_accuracy: 0,
              clarity: 0,
              completeness: 0,
              depth: 0
            }
          });
        }
      }
    } else {
      // Mark interview as completed and calculate final score
      const totalScore = interviewData.questions.reduce((sum, q) => sum + (q.aiScore || 0), 0);
      const finalScore = Math.round(totalScore / interviewData.questions.length);
      const summary = await generateSummary(interviewData.questions);
      
      interviewData.finalScore = finalScore;
      interviewData.summary = summary;
      interviewData.status = 'completed';
      interviewData.endDate = new Date();
      await interviewData.save();

      // Update candidate status
      await candidate.findByIdAndUpdate(interviewData.candidateId, {
        score: finalScore,
        summary,
        interviewStatus: 'completed'
      });
    }

    res.status(200).json({
      questionIndex,
      score: scoringResult.score,
      reasoning: scoringResult.reasoning,
      breakdown: scoringResult.breakdown,
      nextQuestion: nextQuestion,
      isInterviewComplete: isLastQuestion
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to submit answer',
      statusCode: 500
    });
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