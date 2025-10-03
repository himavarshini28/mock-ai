"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const candidateController_1 = require("../controllers/candidateController");
const router = express_1.default.Router();
router.get('/', candidateController_1.getCandidates);
router.get('/:id', candidateController_1.getCandidateById);
router.post('/', candidateController_1.upload.single('resume'), candidateController_1.createCandidate);
exports.default = router;
//# sourceMappingURL=candidatesRoutes.js.map