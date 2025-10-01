import mongoose, { Document } from "mongoose";
import { ICandidate } from "./candidate";

interface IChat extends Document
{
    interviewId:mongoose.Types.ObjectId | ICandidate,
    sender:string,
    message:string,
    timestamp:Date
}

const chatSchema = new mongoose.Schema<IChat>(
  {
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true },
    sender: { type: String, enum: ["system", "candidate", "ai"], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }
);

export const Chat = mongoose.model<IChat>("Chat", chatSchema);
