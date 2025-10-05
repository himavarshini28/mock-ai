import mongoose, { Document } from "mongoose";
import { ICandidate } from "./candidate";
interface IQuestion {
    question: string;
    answer: string;
    aiScore: number;
    timeTaken: number;
    level: "easy" | "medium" | "hard";
    reasoning?: string;
    breakdown?: {
        technical_accuracy: number;
        clarity: number;
        completeness: number;
        depth: number;
    };
}
interface Iinterview extends Document {
    candidateId: mongoose.Types.ObjectId | ICandidate;
    jobPosition?: string;
    experienceLevel?: string;
    techStack?: string[];
    questions: IQuestion[];
    status: "not-started" | "in-progress" | "completed" | "pending";
    finalScore: number;
    summary: string;
    startDate: Date;
    endDate: Date;
}
export declare const interview: mongoose.Model<Iinterview, {}, {}, {}, mongoose.Document<unknown, {}, Iinterview, {}, {}> & Iinterview & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export {};
//# sourceMappingURL=interview.d.ts.map