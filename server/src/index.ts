import express,{Request,Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import {connectDB} from "./config/database";

dotenv.config();
connectDB();

const app=express();
const PORT: number|string=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/',(req:Request,res:Response)=>{
    res.json({message:"server is running"});
});

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})