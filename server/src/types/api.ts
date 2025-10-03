import mongoose from "mongoose";
import { ICandidate } from "../models/candidate";
export interface CreateCandidateRequest{
    resume:Express.Multer.File,
    name?:string,
    email?:string,
    phone?:string
}

export interface candidateListQuery
{
    search?:string,
    order?:"asc"|"desc",
    sortBy?:"name"|"email"|"phone"|"score"|"createdAt",
    page?:number,
    limit?:number
}

export interface CandidateDetailParams {
  id: string;
}

export interface createChatRequest
{
    interviewId: mongoose.Types.ObjectId,
    sender:"ai"|"candidate",
    timestamp?:Date,
    message:string
}

export interface SubmitAnswerRequest{
    interviewId:mongoose.Types.ObjectId,
    questionId:mongoose.Types.ObjectId,
    answer:string,
    timeTaken:number,
}

export interface completeInterviewRequest
{
    interviewId:mongoose.Types.ObjectId
}

export interface createCandidateResponse{
    success:boolean,
    data?:ICandidate,
    message?:string,
    missingFields?:string[]
}

export interface getCandidateResponse{
     success: boolean,
    data: ICandidate[],
    pagination: {
        page: number,
        limit: number,
        total: number,
        pages: number
    }
}

export interface submitAnswerResponse{
    success: boolean,
    score: number,
    feedback: string,
    nextQuestion?: {
        id: string,
        text: string,
        level: "easy" | "medium" | "hard",
        timeLimit: number
    },
    isInterviewComplete: boolean
}

export interface getCandidateDetailsResponse {
    success: boolean,
    data: {
        candidate: ICandidate,
    }
}

export interface completeInterviewResponse {
    success: boolean,
    data: {
        finalScore: number,
        summary: string,
        interview?: any  
    }
}

export interface createChatResponse {
    success: boolean,
    data?: any  
}

export interface ErrorResponse {
    success: false,
    error: string,
    message: string,
    statusCode: number
}