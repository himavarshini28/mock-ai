import mongoose, { Document } from "mongoose";

export interface ICandidate extends Document
{
    name:string,
    email:string,
    phone:string,
    resumeUrl:string,
    interviewStatus:"not-started"|"in-progress"|"completed",
    score:number,
    summary:string
}

const candidateSchema = new mongoose.Schema<ICandidate>(
    {
        name:
        {
            type:String,
            required:true
        },
        email:
        {
            type:String,
            required:true
        },
        phone:
        {
            type:String, 
            required:true
        },
        resumeUrl:
        {
            type:String
        },
        interviewStatus:
        {
            type:String,
            enum:["not-started","in-progress","completed"],
            default:"not-started"
        },
        score:
        {
            type:Number,
            default:0
        },
        summary:
        {
            type:String,
            default:""
        }
    },
    {
        timestamps:true
    }
);



export const candidate = mongoose.model<ICandidate>("candidate",candidateSchema);