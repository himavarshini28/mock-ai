"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const candidate_1 = require("../models/candidate");
const auth_1 = __importDefault(require("../middleware/auth"));
const candidateController_1 = require("../controllers/candidateController");
const router = (0, express_1.Router)();
router.get('/', auth_1.default, async (req, res) => {
    try {
        const candidates = await candidate_1.candidate.find({ userId: req.userId })
            .sort({ score: -1, createdAt: -1 })
            .select('-__v');
        res.json({
            success: true,
            data: candidates,
            count: candidates.length
        });
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch candidates',
            error: error.message
        });
    }
});
router.get('/:id', auth_1.default, async (req, res) => {
    try {
        const candidateRecord = await candidate_1.candidate.findOne({
            _id: req.params.id,
            userId: req.userId
        });
        if (!candidateRecord) {
            res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
            return;
        }
        res.json({
            success: true,
            data: candidateRecord
        });
    }
    catch (error) {
        console.error('Error fetching candidate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch candidate',
            error: error.message
        });
    }
});
router.patch('/:id', auth_1.default, async (req, res) => {
    try {
        const allowedUpdates = ['name', 'email', 'phone', 'interviewStatus', 'score', 'summary'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidOperation) {
            res.status(400).json({
                success: false,
                message: 'Invalid updates'
            });
            return;
        }
        const candidateRecord = await candidate_1.candidate.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true, runValidators: true });
        if (!candidateRecord) {
            res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
            return;
        }
        res.json({
            success: true,
            data: candidateRecord
        });
    }
    catch (error) {
        console.error('Error updating candidate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update candidate',
            error: error.message
        });
    }
});
router.delete('/:id', auth_1.default, async (req, res) => {
    try {
        const candidateRecord = await candidate_1.candidate.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });
        if (!candidateRecord) {
            res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Candidate deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting candidate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete candidate',
            error: error.message
        });
    }
});
router.get('/stats/overview', auth_1.default, async (req, res) => {
    try {
        const totalCandidates = await candidate_1.candidate.countDocuments({ userId: req.userId });
        const completedCandidates = await candidate_1.candidate.countDocuments({
            userId: req.userId,
            interviewStatus: 'completed'
        });
        const inProgressCandidates = await candidate_1.candidate.countDocuments({
            userId: req.userId,
            interviewStatus: 'in-progress'
        });
        const completedCandidatesWithScores = await candidate_1.candidate.find({
            userId: req.userId,
            interviewStatus: 'completed',
            score: { $exists: true, $ne: null }
        }).select('score');
        const averageScore = completedCandidatesWithScores.length > 0
            ? Math.round(completedCandidatesWithScores.reduce((sum, c) => sum + c.score, 0) / completedCandidatesWithScores.length)
            : 0;
        res.json({
            success: true,
            data: {
                totalCandidates,
                completedCandidates,
                inProgressCandidates,
                notStartedCandidates: totalCandidates - completedCandidates - inProgressCandidates,
                averageScore
            }
        });
    }
    catch (error) {
        console.error('Error fetching candidate statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});
router.post('/upload-resume', candidateController_1.upload.single('resume'), candidateController_1.createCandidate);
exports.default = router;
//# sourceMappingURL=candidates.js.map