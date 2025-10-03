"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const interviewController_1 = require("../controllers/interviewController");
const router = express_1.default.Router();
router.post('/:id/start', interviewController_1.startInterview);
router.post('/:id/question', interviewController_1.submitAnswer);
router.post('/:id/complete', interviewController_1.completeInterview);
exports.default = router;
//# sourceMappingURL=interviewRoutes.js.map