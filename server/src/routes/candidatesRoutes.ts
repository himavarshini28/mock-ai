import express from "express";
import { getCandidates, createCandidate, getCandidateById, upload, validateFileUpload } from "../controllers/candidateController";
import auth, { AuthRequest } from "../middleware/auth";

const router = express.Router();

router.get('/', auth, getCandidates);

router.get('/:id', auth, (req: AuthRequest, res) => {
  getCandidateById(req as any, res);
});

router.post('/', auth, upload.single('resume'), validateFileUpload, createCandidate);

// Upload resume endpoint - temporarily without auth for debugging
router.post('/upload-resume', upload.single('resume'), validateFileUpload, createCandidate);

// Simple test upload endpoint for debugging
router.post('/test-upload', upload.single('resume'), (req, res): void => {
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
  } catch (error: any) {
    console.error('Test upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

export default router;