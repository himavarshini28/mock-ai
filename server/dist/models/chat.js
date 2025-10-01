"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chatSchema = new mongoose_1.default.Schema({
    interviewId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Interview", required: true },
    sender: { type: String, enum: ["system", "candidate", "ai"], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
exports.Chat = mongoose_1.default.model("Chat", chatSchema);
//# sourceMappingURL=chat.js.map