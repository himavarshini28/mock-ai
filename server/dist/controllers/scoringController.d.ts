import { Request, Response } from "express";
interface ScoreAnswerRequest extends Request {
    body: {
        interviewId: string;
        questionIndex: number;
        question: string;
        answer: string;
        difficulty: 'easy' | 'medium' | 'hard';
    };
}
interface CompleteInterviewRequest extends Request {
    body: {
        interviewId: string;
        finalScore: number;
    };
}
export declare const scoreAnswerEndpoint: (req: ScoreAnswerRequest, res: Response) => Promise<void>;
export declare const completeInterviewEndpoint: (req: CompleteInterviewRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=scoringController.d.ts.map