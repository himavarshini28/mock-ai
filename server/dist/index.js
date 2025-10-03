"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const candidatesRoutes_1 = __importDefault(require("./routes/candidatesRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const interviewRoutes_1 = __importDefault(require("./routes/interviewRoutes"));
dotenv_1.default.config();
(0, database_1.connectDB)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
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
app.use('/api/candidates', candidatesRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/interview', interviewRoutes_1.default);
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
//# sourceMappingURL=index.js.map