"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const candidateController_1 = require("../controllers/candidateController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.get('/', auth_1.default, candidateController_1.getCandidates);
router.get('/:id', auth_1.default, (req, res) => {
    (0, candidateController_1.getCandidateById)(req, res);
});
router.post('/', auth_1.default, candidateController_1.upload.single('resume'), candidateController_1.validateFileUpload, candidateController_1.createCandidate);
router.post('/upload-resume', candidateController_1.upload.single('resume'), candidateController_1.validateFileUpload, candidateController_1.createCandidate);
router.post('/test-upload', candidateController_1.upload.single('resume'), (req, res) => {
    try {
        console.log('Test upload received:', req.file);
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    }
    catch (error) {
        console.error('Test upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=candidatesRoutes.js.map