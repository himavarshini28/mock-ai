import express from "express";
import { startInterview, submitAnswer, completeInterview } from "../controllers/interviewController";

const router = express.Router();

router.post('/:id/start', startInterview);

router.post('/:id/question', submitAnswer);

router.post('/:id/complete', completeInterview);

export default router;