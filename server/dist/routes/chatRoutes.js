"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
router.post('/:interviewId', chatController_1.createChatMessage);
router.get('/:interviewId', chatController_1.getChatMessages);
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map