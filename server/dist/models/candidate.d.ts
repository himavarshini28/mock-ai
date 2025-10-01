import mongoose, { Document } from "mongoose";
export interface ICandidate extends Document {
    name: string;
    email: string;
    phone: string;
    resumeUrl: string;
    interviewStatus: "not-started" | "in-progress" | "completed";
    score: number;
    summary: string;
}
export declare const candidate: mongoose.Model<ICandidate, {}, {}, {}, mongoose.Document<unknown, {}, ICandidate, {}, {}> & ICandidate & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=candidate.d.ts.map