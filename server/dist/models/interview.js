"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const questionSchema = new mongoose_1.default.Schema({
    question: String,
    answer: String,
    level: {
        type: String,
        enum: ["easy", "medium", "hard"],
    },
    aiScore: Number,
    timeTaken: Number
});
const interviewSchema = new mongoose_1.default.Schema({
    candidateId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "candidate",
        required: true
    },
    questions: [
        questionSchema
    ],
    status: {
        type: String,
        enum: ["not-started", "in-progress", "completed"],
        default: "not-started"
    },
    finalScore: {
        type: Number,
        default: 0
    },
    summary: {
        type: String,
        default: ""
    },
    startDate: Date,
    endDate: Date
}, {
    timestamps: true
});
exports.interview = mongoose_1.default.model("interview", interviewSchema);
//# sourceMappingURL=interview.js.map