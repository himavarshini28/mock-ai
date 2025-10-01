"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.candidate = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const candidateSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    resumeUrl: {
        type: String
    },
    interviewStatus: {
        type: String,
        enum: ["not-started", "in-progress", "completed"],
        default: "not-started"
    },
    score: {
        type: Number,
        default: 0
    },
    summary: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});
exports.candidate = mongoose_1.default.model("candidate", candidateSchema);
//# sourceMappingURL=candidate.js.map