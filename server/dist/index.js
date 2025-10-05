"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const candidates_1 = __importDefault(require("./routes/candidates"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const interviewRoutes_1 = __importDefault(require("./routes/interviewRoutes"));
dotenv_1.default.config();
(0, database_1.connectDB)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.path === '/api/candidates/upload-resume') {
        console.log('🔥 UPLOAD RESUME ENDPOINT HIT!');
    }
    next();
});
app.get('/', (req, res) => {
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
app.use('/api/auth', authRoutes_1.default);
app.use('/api/candidates', candidates_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/interview', interviewRoutes_1.default);
app.use('/api/interviews', interviewRoutes_1.default);
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
//# sourceMappingURL=index.js.map