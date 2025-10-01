import mongoose, { Document } from "mongoose";
import { ICandidate } from "./candidate";
interface IChat extends Document {
    interviewId: mongoose.Types.ObjectId | ICandidate;
    sender: string;
    message: string;
    timestamp: Date;
}
export declare const Chat: mongoose.Model<IChat, {}, {}, {}, mongoose.Document<unknown, {}, IChat, {}, {}> & IChat & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export {};
//# sourceMappingURL=chat.d.ts.map