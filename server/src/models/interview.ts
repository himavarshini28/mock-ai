import mongoose, { Document } from "mongoose";
import { ICandidate } from "./candidate";

interface IQuestion
{
    question:string,
    answer:string,
    aiScore:number,
    timeTaken:number,
    level:"easy"|"medium"|"hard"
}

interface Iinterview extends Document
{
    candidateId:mongoose.Types.ObjectId | ICandidate,
    questions:IQuestion[],
    status:"not-started"|"in-progress"|"completed",
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
                timeTaken:Number 
           
});

const interviewSchema = new mongoose.Schema<Iinterview>(
    {
        candidateId:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"candidate",
            required:true
        },
        questions:
        [
           questionSchema
        ],
        status:
        {
            type:String,
            enum:["not-started","in-progress","completed"],
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