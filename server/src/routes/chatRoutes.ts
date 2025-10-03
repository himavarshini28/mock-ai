import express from "express";
import { createChatMessage, getChatMessages } from "../controllers/chatController";

const router = express.Router();

router.post('/:interviewId', createChatMessage);

router.get('/:interviewId', getChatMessages);

export default router;