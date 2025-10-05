"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const interviewController_1 = require("../controllers/interviewController");
const scoringController_1 = require("../controllers/scoringController");
const router = express_1.default.Router();
router.get('/', interviewController_1.getInterviews);
router.post('/', interviewController_1.createInterview);
router.get('/:id', interviewController_1.getInterviewById);
router.post('/:id/start', interviewController_1.startInterview);
router.post('/:id/question', interviewController_1.submitAnswer);
router.post('/:id/answer', interviewController_1.submitAnswer);
router.post('/score-answer', scoringController_1.scoreAnswerEndpoint);
router.post('/:id/complete', interviewController_1.completeInterview);
router.post('/complete', scoringController_1.completeInterviewEndpoint);
exports.default = router;
//# sourceMappingURL=interviewRoutes.js.map