"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeInterviewEndpoint = exports.scoreAnswerEndpoint = void 0;
const interview_1 = require("../models/interview");
const candidate_1 = require("../models/candidate");
const aiHelpers_1 = require("../utils/aiHelpers");
const scoreAnswerEndpoint = async (req, res) => {
    try {
        const { interviewId, questionIndex, question, answer, difficulty } = req.body;
        if (!interviewId || typeof questionIndex !== 'number' || !question || !answer) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Missing required fields: interviewId, questionIndex, question, answer',
                statusCode: 400
            });
            return;
        }
        const interviewRecord = await interview_1.interview.findById(interviewId);
        if (!interviewRecord) {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Interview not found',
                statusCode: 404
            });
            return;
        }
        let score = 75;
        try {
            const scoreResult = await (0, aiHelpers_1.scoreAnswer)(question, answer);
            score = scoreResult.score || 75;
            console.log(`AI scored answer: ${score} for question: ${question.substring(0, 50)}...`);
        }
        catch (aiError) {
            console.error('AI scoring failed, using fallback scoring:', aiError);
            const answerLength = answer.trim().length;
            const hasKeywords = /\b(experience|project|challenge|solution|technology|javascript|react|node|database|api|frontend|backend|fullstack)\b/i.test(answer);
            if (answerLength < 20) {
                score = Math.floor(Math.random() * 20) + 30;
            }
            else if (answerLength < 100) {
                score = Math.floor(Math.random() * 25) + 55;
            }
            else if (hasKeywords && answerLength > 100) {
                score = Math.floor(Math.random() * 20) + 75;
            }
            else {
                score = Math.floor(Math.random() * 25) + 65;
            }
        }
        score = Math.max(0, Math.min(100, score));
        const questionData = {
            questionIndex,
            question,
            answer,
            score,
            difficulty,
            timestamp: new Date()
        };
        await interview_1.interview.findByIdAndUpdate(interviewId, {
            $push: { questions: questionData },
            $set: {
                status: questionIndex >= 5 ? 'completed' : 'in-progress',
                updatedAt: new Date()
            }
        });
        res.status(200).json({
            success: true,
            score,
            message: 'Answer scored successfully'
        });
    }
    catch (error) {
        console.error('Error scoring answer:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to score answer',
            statusCode: 500
        });
    }
};
exports.scoreAnswerEndpoint = scoreAnswerEndpoint;
const completeInterviewEndpoint = async (req, res) => {
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
        const interviewRecord = await interview_1.interview.findById(interviewId).populate('candidateId');
        if (!interviewRecord) {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Interview not found',
                statusCode: 404
            });
            return;
        }
        let aiSummary = `Interview completed with a score of ${finalScore}/100.`;
        try {
            const answers = interviewRecord.questions?.map((q) => q.answer) || [];
            if (answers.length > 0) {
                aiSummary = await (0, aiHelpers_1.generateSummary)(answers);
            }
        }
        catch (error) {
            console.error('AI summary generation failed:', error);
        }
        await interview_1.interview.findByIdAndUpdate(interviewId, {
            status: 'completed',
            finalScore,
            summary: aiSummary,
            completedAt: new Date(),
            updatedAt: new Date()
        });
        await candidate_1.candidate.findByIdAndUpdate(interviewRecord.candidateId, {
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
    }
    catch (error) {
        console.error('Error completing interview:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to complete interview',
            statusCode: 500
        });
    }
};
exports.completeInterviewEndpoint = completeInterviewEndpoint;
//# sourceMappingURL=scoringController.js.map