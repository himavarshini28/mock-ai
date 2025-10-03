import { Request, Response } from "express";
import { Chat } from "../models/chat";
import { 
  createChatRequest, 
  createChatResponse, 
  ErrorResponse 
} from "../types/api";

export const createChatMessage = async (req: Request, res: Response<createChatResponse | ErrorResponse>): Promise<void> => {
  try {
    const { interviewId } = req.params;
    const { sender, message } = req.body as createChatRequest;

    if (!sender || !message) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Sender and message are required',
        statusCode: 400
      });
      return;
    }

    const newChatMessage = new Chat({
      interviewId,
      sender,
      message,
      timestamp: new Date()
    });

    const savedMessage = await newChatMessage.save();

    const response: createChatResponse = {
      success: true,
      data: savedMessage
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error creating chat message:', error);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to create chat message',
      statusCode: 500
    };
    
    res.status(500).json(errorResponse);
  }
};

export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { interviewId } = req.params;

    const messages = await Chat.find({ interviewId })
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch chat messages',
      statusCode: 500
    };
    
    res.status(500).json(errorResponse);
  }
};