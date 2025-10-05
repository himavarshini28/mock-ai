import express, {Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import {connectDB} from "./config/database";
import authRoutes from "./routes/authRoutes";
import candidateRoutes from "./routes/candidates";
import chatRoutes from "./routes/chatRoutes";
import interviewRoutes from "./routes/interviewRoutes";

dotenv.config();
connectDB();

const app = express();
const PORT: number|string = process.env.PORT || 5000;

app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());

// Add request logging middleware for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.path === '/api/candidates/upload-resume') {
        console.log('🔥 UPLOAD RESUME ENDPOINT HIT!');
    }
    next();
});

app.get('/', (req: Request, res: Response) => {
    res.json({
        message: "AI Interview Assistant API is running!",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            candidates: "/api/candidates",
            chat: "/api/chat",
            interview: "/api/interview"
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/interviews', interviewRoutes); // Add plural route for frontend compatibility

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/auth/me`);
    console.log(`   GET    /api/candidates`);
    console.log(`   POST   /api/candidates`);
    console.log(`   POST   /api/candidates/upload-resume`);
    console.log(`   GET    /api/candidates/:id`);
    console.log(`   POST   /api/chat/:interviewId`);
    console.log(`   GET    /api/chat/:interviewId`);
    console.log(`   GET    /api/interview`);
    console.log(`   POST   /api/interview`);
    console.log(`   GET    /api/interviews (same as above)`);
    console.log(`   POST   /api/interviews (same as above)`);
    console.log(`   POST   /api/interview/:id/start`);
    console.log(`   POST   /api/interview/:id/question`);
    console.log(`   POST   /api/interview/:id/answer`);
    console.log(`   POST   /api/interview/:id/complete`);
});