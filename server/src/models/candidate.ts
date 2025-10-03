import mongoose, { Document } from "mongoose";

export interface ICandidate extends Document
{
    name:string,
    email:string,
    phone:string,
    resumeUrl:string,
    interviewStatus:"not-started"|"in-progress"|"completed",
    score:number,
    summary:string,
    extractionData?: {
        name: {
            value: string | null;
            confidence: number;
            source: 'ai' | 'regex' | 'manual';
        };
        email: {
            value: string | null;
            confidence: number;
            source: 'ai' | 'regex' | 'manual';
        };
        phone: {
            value: string | null;
            confidence: number;
            source: 'ai' | 'regex' | 'manual';
        };
    };
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
        },
        extractionData: {
            name: {
                value: { type: String, default: null },
                confidence: { type: Number, default: 0, min: 0, max: 1 },
                source: { type: String, enum: ['ai', 'regex', 'manual'], default: 'ai' }
            },
            email: {
                value: { type: String, default: null },
                confidence: { type: Number, default: 0, min: 0, max: 1 },
                source: { type: String, enum: ['ai', 'regex', 'manual'], default: 'ai' }
            },
            phone: {
                value: { type: String, default: null },
                confidence: { type: Number, default: 0, min: 0, max: 1 },
                source: { type: String, enum: ['ai', 'regex', 'manual'], default: 'ai' }
            }
        }
    },
    {
        timestamps:true
    }
);



export const candidate = mongoose.model<ICandidate>("candidate",candidateSchema);