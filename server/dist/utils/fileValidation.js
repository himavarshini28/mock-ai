"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupFile = exports.validateFileUpload = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760');
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${sanitizedFilename}`;
        cb(null, uniqueName);
    }
});
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error(`Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`));
    }
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return cb(new Error(`Invalid MIME type. Expected PDF or DOCX but got ${mimeType}.`));
    }
    cb(null, true);
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    }
});
const validateFileUpload = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large',
                message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
                statusCode: 400
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files',
                message: 'Only one file is allowed',
                statusCode: 400
            });
        }
    }
    if (error.message.includes('Invalid file type') || error.message.includes('Invalid MIME type')) {
        return res.status(400).json({
            success: false,
            error: 'Invalid file',
            message: error.message,
            statusCode: 400
        });
    }
    next(error);
};
exports.validateFileUpload = validateFileUpload;
const cleanupFile = (filePath) => {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.error('Error cleaning up file:', error);
    }
};
exports.cleanupFile = cleanupFile;
//# sourceMappingURL=fileValidation.js.map