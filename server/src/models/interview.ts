import mongoose, { Document } from "mongoose";
import { ICandidate } from "./candidate";

interface IQuestion
{
    question:string,
    answer:string,
    aiScore:number,
    timeTaken:number,
    level:"easy"|"medium"|"hard",
    reasoning?: string,
    breakdown?: {
        technical_accuracy: number;
        clarity: number;
        completeness: number;
        depth: number;
    }
}

interface Iinterview extends Document
{
    candidateId:mongoose.Types.ObjectId | ICandidate,
    jobPosition?: string,
    experienceLevel?: string,
    techStack?: string[],
    questions:IQuestion[],
    status:"not-started"|"in-progress"|"completed"|"pending",
    finalScore:number,
    summary:string,
    startDate:Date,
    endDate:Date
}

const questionSchema= new mongoose.Schema<IQuestion>(
{
     
                question: String,
                answer:String,       
                level:
                {
                    type:String,
                    enum:["easy","medium","hard"],   
                },
                aiScore:Number,
                timeTaken:Number,
                reasoning: { type: String, default: "" },
                breakdown: {
                    technical_accuracy: { type: Number, default: 0 },
                    clarity: { type: Number, default: 0 },
                    completeness: { type: Number, default: 0 },
                    depth: { type: Number, default: 0 }
                }
           
});

const interviewSchema = new mongoose.Schema<Iinterview>(
    {
        candidateId:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"candidate",
            required:true
        },
        jobPosition: {
            type: String,
            default: "Software Developer"
        },
        experienceLevel: {
            type: String,
            default: "Mid-level"
        },
        techStack: {
            type: [String],
            default: ["JavaScript", "React"]
        },
        questions:
        [
           questionSchema
        ],
        status:
        {
            type:String,
            enum:["not-started","in-progress","completed","pending"],
            default:"not-started"
        },
        finalScore:
        {
            type:Number,
            default:0
        },
        summary:
        {
            type:String,
            default:""
        },
        startDate:Date,
        endDate:Date
    },
    {
        timestamps:true
    }
);

export const interview = mongoose.model<Iinterview>("interview",interviewSchema);