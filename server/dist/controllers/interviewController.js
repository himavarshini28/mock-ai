"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeInterview = exports.submitAnswer = exports.startInterview = void 0;
const interview_1 = require("../models/interview");
const candidate_1 = require("../models/candidate");
const aiHelpers_1 = require("../utils/aiHelpers");
const startInterview = async (req, res) => {
    try {
        const { id: candidateId } = req.params;
        const candidateData = await candidate_1.candidate.findById(candidateId);
        if (!candidateData) {
            res.status(404).json({
                success: false,
                error: 'Not found',
                message: 'Candidate not found',
                statusCode: 404
            });
            return;
        }
        let interviewData = await interview_1.interview.findOne({ candidateId });
        if (!interviewData) {
            interviewData = new interview_1.interview({
                candidateId,
                questions: [],
                status: 'in-progress',
                finalScore: 0,
                summary: '',
                startDate: new Date()
            });
            await interviewData.save();
        }
        const firstQuestion = await (0, aiHelpers_1.generateQuestion)('easy', 1);
        res.status(200).json({
            success: true,
            data: {
                interviewId: interviewData._id,
                question: firstQuestion,
                questionNumber: 1,
                totalQuestions: 6
            }
        });
    }
    catch (error) {
        console.error('Error starting interview:', error);
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'Failed to start interview',
            statusCode: 500
        };
        res.status(500).json(errorResponse);
    }
};
exports.startInterview = startInterview;
const submitAnswer = async (req, res) => {
    try {
        const { id: interviewId } = req.params;
        const { questionId, answer, timeTaken } = req.body;
        const interviewData = await interview_1.interview.findById(interviewId);
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
        const scoringResult = await (0, aiHelpers_1.scoreAnswer)(questionText, answer);
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
            nextQuestion = await (0, aiHelpers_1.generateQuestion)(nextLevel, currentQuestionIndex + 2);
        }
        const response = {
            success: true,
            score: scoringResult.score,
            feedback,
            nextQuestion,
            isInterviewComplete: isComplete
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error submitting answer:', error);
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'Failed to submit answer',
            statusCode: 500
        };
        res.status(500).json(errorResponse);
    }
};
exports.submitAnswer = submitAnswer;
const completeInterview = async (req, res) => {
    try {
        const { id: interviewId } = req.params;
        const interviewData = await interview_1.interview.findById(interviewId);
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
        const summary = await (0, aiHelpers_1.generateSummary)(interviewData.questions);
        interviewData.finalScore = finalScore;
        interviewData.summary = summary;
        interviewData.status = 'completed';
        interviewData.endDate = new Date();
        await interviewData.save();
        await candidate_1.candidate.findByIdAndUpdate(interviewData.candidateId, {
            score: finalScore,
            summary,
            interviewStatus: 'completed'
        });
        const response = {
            success: true,
            data: {
                finalScore,
                summary,
                interview: interviewData
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error completing interview:', error);
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'Failed to complete interview',
            statusCode: 500
        };
        res.status(500).json(errorResponse);
    }
};
exports.completeInterview = completeInterview;
//# sourceMappingURL=interviewController.js.map