import express from "express";
import { getCandidates, createCandidate, getCandidateById, upload } from "../controllers/candidateController";

const router = express.Router();

router.get('/', getCandidates);

router.get('/:id', getCandidateById);

router.post('/', upload.single('resume'), createCandidate);

export default router;