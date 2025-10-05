import mongoose from "mongoose";
import { ICandidate } from "../models/candidate";
export interface CreateCandidateRequest {
    resume: Express.Multer.File;
    name?: string;
    email?: string;
    phone?: string;
}
export interface candidateListQuery {
    search?: string;
    order?: "asc" | "desc";
    sortBy?: "name" | "email" | "phone" | "score" | "createdAt";
    page?: number;
    limit?: number;
}
export interface CandidateDetailParams {
    id: string;
}
export interface createChatRequest {
    interviewId: mongoose.Types.ObjectId;
    sender: "ai" | "candidate";
    timestamp?: Date;
    message: string;
}
export interface SubmitAnswerRequest {
    questionIndex: number;
    answer: string;
}
export interface completeInterviewRequest {
    interviewId: mongoose.Types.ObjectId;
}
export interface createCandidateResponse {
    success: boolean;
    data?: ICandidate;
    message?: string;
    missingFields?: string[];
    extractionData?: {
        name: {
            value: string | null;
            confidence: number;
            source: 'ai' | 'regex' | 'manual';
        };
        email: {
            value: string | null;
            confidence: number;
            source: 'ai' | 'regex' | 'manual';
        };
        phone: {
            value: string | null;
            confidence: number;
            source: 'ai' | 'regex' | 'manual';
        };
    };
}
export interface getCandidateResponse {
    success: boolean;
    data: ICandidate[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface submitAnswerResponse {
    questionIndex: number;
    score: number;
    reasoning: string;
    breakdown: {
        technical_accuracy: number;
        clarity: number;
        completeness: number;
        depth: number;
    };
    nextQuestion?: {
        id: string;
        text: string;
        level: 'easy' | 'medium' | 'hard';
        timeLimit: number;
    } | null;
    isInterviewComplete: boolean;
}
export interface getCandidateDetailsResponse {
    success: boolean;
    data: {
        candidate: ICandidate;
        interview?: any;
        chats: any[];
    };
}
export interface completeInterviewResponse {
    success: boolean;
    data: {
        finalScore: number;
        summary: string;
        interview?: any;
    };
}
export interface createChatResponse {
    success: boolean;
    data?: any;
}
export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
    statusCode: number;
}
//# sourceMappingURL=api.d.ts.map