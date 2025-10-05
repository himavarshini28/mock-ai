"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeInterview = exports.submitAnswer = exports.startInterview = exports.createInterview = exports.getInterviewById = exports.getInterviews = void 0;
const interview_1 = require("../models/interview");
const candidate_1 = require("../models/candidate");
const aiHelpers_1 = require("../utils/aiHelpers");
const getInterviews = async (req, res) => {
    try {
        const interviews = await interview_1.interview.find()
            .populate('candidateId', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            interviews
        });
    }
    catch (error) {
        console.error('Error fetching interviews:', error);
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch interviews',
            statusCode: 500
        };
        res.status(500).json(errorResponse);
    }
};
exports.getInterviews = getInterviews;
const getInterviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const interviewData = await interview_1.interview.findById(id)
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
    }
    catch (error) {
        console.error('Error fetching interview:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch interview',
            statusCode: 500
        });
    }
};
exports.getInterviewById = getInterviewById;
const createInterview = async (req, res) => {
    try {
        const { candidateId, jobPosition, experienceLevel, techStack } = req.body;
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
        const existingInterview = await interview_1.interview.findOne({ candidateId });
        if (existingInterview) {
            res.status(409).json({
                success: false,
                error: 'Conflict',
                message: 'Interview already exists for this candidate',
                statusCode: 409
            });
            return;
        }
        const newInterview = new interview_1.interview({
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
        await candidate_1.candidate.findByIdAndUpdate(candidateId, {
            interviewStatus: 'pending'
        });
        res.status(201).json({
            success: true,
            interview: newInterview
        });
    }
    catch (error) {
        console.error('Error creating interview:', error);
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'Failed to create interview',
            statusCode: 500
        };
        res.status(500).json(errorResponse);
    }
};
exports.createInterview = createInterview;
const startInterview = async (req, res) => {
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
        if (interviewData.status === 'pending' || interviewData.status === 'not-started') {
            interviewData.status = 'in-progress';
            if (!interviewData.startDate) {
                interviewData.startDate = new Date();
            }
            if (interviewData.questions.length === 0) {
                const firstQuestion = await (0, aiHelpers_1.generateQuestion)('easy', 1);
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
        const currentQuestionIndex = interviewData.questions.findIndex(q => !q.answer);
        const questionIndex = currentQuestionIndex === -1 ? 0 : currentQuestionIndex;
        let currentQuestion;
        if (questionIndex < interviewData.questions.length) {
            const storedQuestion = interviewData.questions[questionIndex];
            currentQuestion = {
                id: `q_${Date.now()}_${questionIndex + 1}`,
                text: storedQuestion.question,
                level: storedQuestion.level,
                timeLimit: storedQuestion.level === 'easy' ? 120 : storedQuestion.level === 'medium' ? 180 : 240
            };
        }
        else {
            const difficulty = questionIndex < 2 ? 'easy' : questionIndex < 4 ? 'medium' : 'hard';
            currentQuestion = await (0, aiHelpers_1.generateQuestion)(difficulty, questionIndex + 1);
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
        if (questionIndex < 0 || questionIndex >= 6) {
            res.status(400).json({
                success: false,
                error: 'Bad request',
                message: 'Invalid question index',
                statusCode: 400
            });
            return;
        }
        const difficulty = questionIndex < 2 ? 'easy' : questionIndex < 4 ? 'medium' : 'hard';
        let questionText;
        if (interviewData.questions.length > questionIndex && interviewData.questions[questionIndex].question) {
            questionText = interviewData.questions[questionIndex].question;
        }
        else {
            const questionObj = await (0, aiHelpers_1.generateQuestion)(difficulty, questionIndex + 1);
            questionText = questionObj.text;
        }
        const scoringResult = await (0, aiHelpers_1.scoreAnswer)(questionText, answer);
        if (interviewData.questions.length > questionIndex) {
            interviewData.questions[questionIndex] = {
                question: questionText,
                answer,
                level: difficulty,
                aiScore: scoringResult.score,
                timeTaken: 0,
                reasoning: scoringResult.reasoning,
                breakdown: scoringResult.breakdown
            };
        }
        else {
            interviewData.questions.push({
                question: questionText,
                answer,
                level: difficulty,
                aiScore: scoringResult.score,
                timeTaken: 0,
                reasoning: scoringResult.reasoning,
                breakdown: scoringResult.breakdown
            });
        }
        await interviewData.save();
        let nextQuestion = null;
        const isLastQuestion = questionIndex >= 5;
        if (!isLastQuestion) {
            const nextDifficulty = (questionIndex + 1) < 2 ? 'easy' : (questionIndex + 1) < 4 ? 'medium' : 'hard';
            if (interviewData.questions.length > questionIndex + 1 && interviewData.questions[questionIndex + 1].question) {
                const existingQuestion = interviewData.questions[questionIndex + 1];
                nextQuestion = {
                    id: `q_${Date.now()}_${questionIndex + 2}`,
                    text: existingQuestion.question,
                    level: existingQuestion.level,
                    timeLimit: nextDifficulty === 'easy' ? 120 : nextDifficulty === 'medium' ? 180 : 240
                };
            }
            else {
                nextQuestion = await (0, aiHelpers_1.generateQuestion)(nextDifficulty, questionIndex + 2);
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
        }
        else {
            const totalScore = interviewData.questions.reduce((sum, q) => sum + (q.aiScore || 0), 0);
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
        }
        res.status(200).json({
            questionIndex,
            score: scoringResult.score,
            reasoning: scoringResult.reasoning,
            breakdown: scoringResult.breakdown,
            nextQuestion: nextQuestion,
            isInterviewComplete: isLastQuestion
        });
    }
    catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to submit answer',
            statusCode: 500
        });
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