"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatMessages = exports.createChatMessage = void 0;
const chat_1 = require("../models/chat");
const createChatMessage = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { sender, message } = req.body;
        if (!sender || !message) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Sender and message are required',
                statusCode: 400
            });
            return;
        }
        const newChatMessage = new chat_1.Chat({
            interviewId,
            sender,
            message,
            timestamp: new Date()
        });
        const savedMessage = await newChatMessage.save();
        const response = {
            success: true,
            data: savedMessage
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating chat message:', error);
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'Failed to create chat message',
            statusCode: 500
        };
        res.status(500).json(errorResponse);
    }
};
exports.createChatMessage = createChatMessage;
const getChatMessages = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const messages = await chat_1.Chat.find({ interviewId })
            .sort({ timestamp: 1 });
        res.status(200).json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        console.error('Error fetching chat messages:', error);
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch chat messages',
            statusCode: 500
        };
        res.status(500).json(errorResponse);
    }
};
exports.getChatMessages = getChatMessages;
//# sourceMappingURL=chatController.js.map