import express, {Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import {connectDB} from "./config/database";
import candidateRoutes from "./routes/candidatesRoutes";
import chatRoutes from "./routes/chatRoutes";
import interviewRoutes from "./routes/interviewRoutes";

dotenv.config();
connectDB();

const app = express();
const PORT: number|string = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({
        message: "AI Interview Assistant API is running!",
        version: "1.0.0",
        endpoints: {
            candidates: "/api/candidates",
            chat: "/api/chat",
            interview: "/api/interview"
        }
    });
});

app.use('/api/candidates', candidateRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/interview', interviewRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation:`);
    console.log(`   GET    /api/candidates`);
    console.log(`   POST   /api/candidates`);
    console.log(`   GET    /api/candidates/:id`);
    console.log(`   POST   /api/chat/:interviewId`);
    console.log(`   GET    /api/chat/:interviewId`);
    console.log(`   POST   /api/interview/:id/start`);
    console.log(`   POST   /api/interview/:id/question`);
    console.log(`   POST   /api/interview/:id/complete`);
});