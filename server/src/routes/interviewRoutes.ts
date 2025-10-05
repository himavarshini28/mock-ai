import express from "express";
import { getInterviews, createInterview, startInterview, submitAnswer, completeInterview, getInterviewById } from "../controllers/interviewController";
import { scoreAnswerEndpoint, completeInterviewEndpoint } from "../controllers/scoringController";

const router = express.Router();

// Get all interviews
router.get('/', getInterviews);

// Create new interview
router.post('/', createInterview);

// Get interview by ID
router.get('/:id', getInterviewById);

// Start interview
router.post('/:id/start', startInterview);

// Submit answer (also handle /answer endpoint for frontend compatibility)
router.post('/:id/question', submitAnswer);
router.post('/:id/answer', submitAnswer);

// Score answer endpoint
router.post('/score-answer', scoreAnswerEndpoint);

// Complete interview
router.post('/:id/complete', completeInterview);
router.post('/complete', completeInterviewEndpoint);

export default router;