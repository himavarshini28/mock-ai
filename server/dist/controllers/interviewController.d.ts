import { Request, Response } from "express";
import { submitAnswerResponse, completeInterviewResponse, ErrorResponse } from "../types/api";
export declare const startInterview: (req: Request, res: Response) => Promise<void>;
export declare const submitAnswer: (req: Request, res: Response<submitAnswerResponse | ErrorResponse>) => Promise<void>;
export declare const completeInterview: (req: Request, res: Response<completeInterviewResponse | ErrorResponse>) => Promise<void>;
//# sourceMappingURL=interviewController.d.ts.map