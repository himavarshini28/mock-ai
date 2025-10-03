"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateById = exports.createCandidate = exports.getCandidates = exports.validateFileUpload = exports.upload = void 0;
const candidate_1 = require("../models/candidate");
const interview_1 = require("../models/interview");
const chat_1 = require("../models/chat");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const extractFields_1 = require("../utils/extractFields");
const fs_1 = __importDefault(require("fs"));
const fileValidation_1 = require("../utils/fileValidation");
Object.defineProperty(exports, "upload", { enumerable: true, get: function () { return fileValidation_1.upload; } });
Object.defineProperty(exports, "validateFileUpload", { enumerable: true, get: function () { return fileValidation_1.validateFileUpload; } });
const getCandidates = async (req, res) => {
    try {
        const { search = '', order = 'desc', sortBy = 'createdAt', page = 1, limit = 10 } = req.query;
        const searchQuery = {};
        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const sortObject = {};
        sortObject[sortBy] = order === 'asc' ? 1 : -1;
        const pageNum = parseInt(String(page));
        const limitNum = parseInt(String(limit));
        const skip = (pageNum - 1) * limitNum;
        const candidates = await candidate_1.candidate
            .find(searchQuery)
            .sort(sortObject)
            .skip(skip)
            .limit(limitNum);
        const total = await candidate_1.candidate.countDocuments(searchQuery);
        const pages = Math.ceil(total / limitNum);
        const response = {
            success: true,
            data: candidates,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch candidates',
            statusCode: 500
        };
        res.status(500).json(errorResponse);
    }
};
exports.getCandidates = getCandidates;
const createCandidate = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Resume file is required',
                statusCode: 400
            });
            return;
        }
        let extractedText = '';
        if (file.mimetype === 'application/pdf') {
            const dataBuffer = fs_1.default.readFileSync(file.path);
            const pdfData = await (0, pdf_parse_1.default)(dataBuffer);
            extractedText = pdfData.text;
        }
        const extractedFields = await (0, extractFields_1.extractFieldsAI)(extractedText);
        const candidateData = {
            name: req.body.name || extractedFields.name.value || '',
            email: req.body.email || extractedFields.email.value || '',
            phone: req.body.phone || extractedFields.phone.value || '',
            resumeUrl: file.path,
            interviewStatus: 'not-started',
            score: 0,
            summary: '',
            extractionData: {
                name: extractedFields.name,
                email: extractedFields.email,
                phone: extractedFields.phone
            }
        };
        const missingFields = [];
        if (!candidateData.name)
            missingFields.push('name');
        if (!candidateData.email)
            missingFields.push('email');
        if (!candidateData.phone)
            missingFields.push('phone');
        const newCandidate = new candidate_1.candidate(candidateData);
        const savedCandidate = await newCandidate.save();
        fs_1.default.unlinkSync(file.path);
        const response = {
            success: true,
            data: savedCandidate,
            message: missingFields.length > 0 ? 'Candidate created but some fields are missing' : 'Candidate created successfully',
            missingFields
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating candidate:', error);
        if (req.file) {
            (0, fileValidation_1.cleanupFile)(req.file.path);
        }
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'Failed to create candidate',
            statusCode: 500
        };
        res.status(500).json(errorResponse);
    }
};
exports.createCandidate = createCandidate;
const getCandidateById = async (req, res) => {
    try {
        const { id } = req.params;
        const candidateData = await candidate_1.candidate.findById(id);
        if (!candidateData) {
            res.status(404).json({
                success: false,
                error: 'Not found',
                message: 'Candidate not found',
                statusCode: 404
            });
            return;
        }
        const interviewData = await interview_1.interview.findOne({ candidateId: id });
        const chatData = await chat_1.Chat.find({
            interviewId: interviewData?._id
        }).sort({ timestamp: 1 });
        const response = {
            success: true,
            data: {
                candidate: candidateData,
                interview: interviewData || null,
                chats: chatData
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching candidate details:', error);
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch candidate details',
            statusCode: 500
        };
        res.status(500).json(errorResponse);
    }
};
exports.getCandidateById = getCandidateById;
//# sourceMappingURL=candidateController.js.map