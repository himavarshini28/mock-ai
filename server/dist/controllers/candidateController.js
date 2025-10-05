"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateById = exports.createCandidate = exports.getCandidates = exports.validateFileUpload = exports.upload = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
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
    console.log('=== CREATE CANDIDATE FUNCTION CALLED ===');
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Resume file is required. Please upload a PDF, DOCX, or TXT file.',
                statusCode: 400
            });
            return;
        }
        console.log(`Processing file: ${file.originalname}, Type: ${file.mimetype}, Size: ${file.size}`);
        let extractedText = '';
        try {
            console.log('Processing file type:', file.mimetype);
            if (file.mimetype === 'application/pdf') {
                console.log('Reading PDF file...');
                const dataBuffer = fs_1.default.readFileSync(file.path);
                console.log('PDF buffer size:', dataBuffer.length);
                const pdfData = await (0, pdf_parse_1.default)(dataBuffer);
                extractedText = pdfData.text;
                console.log('PDF text extracted successfully, length:', extractedText.length);
                console.log('First 200 chars:', extractedText.substring(0, 200));
            }
            else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                extractedText = `Uploaded DOCX file: ${file.originalname}`;
                console.log('DOCX file uploaded, basic processing applied');
            }
            else if (file.mimetype === 'text/plain') {
                extractedText = fs_1.default.readFileSync(file.path, 'utf8');
                console.log('Text file processed successfully');
            }
            else {
                console.log('Unknown file type, using basic fallback');
                extractedText = `Resume: ${file.originalname}\nName: \nEmail: \nPhone: `;
            }
            if (!extractedText || extractedText.trim().length < 5) {
                console.warn('No meaningful text extracted, using fallback');
                extractedText = `Resume file uploaded: ${file.originalname}\nPlease provide your details manually.`;
            }
        }
        catch (fileError) {
            console.error('Error processing file:', fileError);
            extractedText = `Resume file: ${file.originalname}\nFile processing failed. Please provide your information manually.`;
        }
        console.log('Extracted text:', extractedText.substring(0, 200) + '...');
        let extractedFields;
        try {
            extractedFields = await (0, extractFields_1.extractFieldsAI)(extractedText);
            console.log('Extraction successful:', extractedFields);
        }
        catch (aiError) {
            console.error('AI extraction failed completely, using fallback:', aiError);
            extractedFields = {
                name: { value: req.body.name || null, confidence: 0, source: 'manual' },
                email: { value: req.body.email || null, confidence: 0, source: 'manual' },
                phone: { value: req.body.phone || null, confidence: 0, source: 'manual' }
            };
        }
        const candidateData = {
            userId: req.userId || new mongoose_1.default.Types.ObjectId('507f1f77bcf86cd799439011'),
            name: req.body.name || extractedFields.name.value || 'Unknown',
            email: req.body.email || extractedFields.email.value || 'unknown@example.com',
            phone: req.body.phone || extractedFields.phone.value || '0000000000',
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
        console.log('Creating candidate with data:', candidateData);
        const newCandidate = new candidate_1.candidate(candidateData);
        const savedCandidate = await newCandidate.save();
        console.log('Candidate saved successfully:', savedCandidate._id);
        try {
            fs_1.default.unlinkSync(file.path);
            console.log('File cleaned up successfully');
        }
        catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
        }
        const response = {
            success: true,
            data: savedCandidate,
            message: missingFields.length > 0
                ? `Candidate created successfully! Please verify: ${missingFields.join(', ')}`
                : 'Candidate created successfully with complete information!',
            missingFields
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating candidate:', error);
        if (req.file) {
            try {
                await (0, fileValidation_1.cleanupFile)(req.file.path);
            }
            catch (cleanupError) {
                console.warn('Could not clean up file after error:', cleanupError);
            }
        }
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? `Failed to process resume: ${error.message}` : 'Failed to create candidate. Please try again or contact support.',
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