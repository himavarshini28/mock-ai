import multer from "multer";
import path from "path";
import fs from "fs";

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${sanitizedFilename}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`));
  }
  
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return cb(new Error(`Invalid MIME type. Expected PDF or DOCX but got ${mimeType}.`));
  }
  
  cb(null, true);
};

export const upload = multer({ 
  storage,
  fileFilter,
  limits: { 
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

export const validateFileUpload = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
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

export const cleanupFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};