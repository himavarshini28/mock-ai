import { Response, Request } from "express";
import { candidate } from "../models/candidate";
import { interview } from "../models/interview";
import { Chat } from "../models/chat";
import { 
  candidateListQuery, 
  getCandidateResponse, 
  ErrorResponse, 
  createCandidateResponse, 
  CreateCandidateRequest,
  CandidateDetailParams,
  getCandidateDetailsResponse
} from "../types/api";
import pdfParse from "pdf-parse";
import { extractFieldsAI } from "../utils/extractFields";
import fs from "fs";
import { upload, validateFileUpload, cleanupFile } from "../utils/fileValidation";

export { upload, validateFileUpload };

export const getCandidates = async (req: Request<{}, getCandidateResponse, {}, candidateListQuery>, res: Response<getCandidateResponse | ErrorResponse>) => {
  try {
    const {
      search = '',
      order = 'desc',
      sortBy = 'createdAt',
      page = 1,
      limit = 10
    } = req.query;  

    const searchQuery: any = {};
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortObject: any = {};
    sortObject[sortBy as string] = order === 'asc' ? 1 : -1;

    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    const candidates = await candidate
      .find(searchQuery)
      .sort(sortObject)
      .skip(skip)
      .limit(limitNum);

    const total = await candidate.countDocuments(searchQuery);
    const pages = Math.ceil(total / limitNum);

    const response: getCandidateResponse = {
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

  } catch (error) {
    console.error('Error fetching candidates:', error);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch candidates',
      statusCode: 500
    };
    
    res.status(500).json(errorResponse);
  }
};

export const createCandidate = async (req: Request, res: Response<createCandidateResponse | ErrorResponse>): Promise<void> => {
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
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    }

    const extractedFields = await extractFieldsAI(extractedText);

    const candidateData = {
      name: req.body.name || extractedFields.name.value || '',
      email: req.body.email || extractedFields.email.value || '',
      phone: req.body.phone || extractedFields.phone.value || '',
      resumeUrl: file.path,
      interviewStatus: 'not-started' as const,
      score: 0,
      summary: '',
      extractionData: {
        name: extractedFields.name,
        email: extractedFields.email,
        phone: extractedFields.phone
      }
    };

    const missingFields: string[] = [];
    if (!candidateData.name) missingFields.push('name');
    if (!candidateData.email) missingFields.push('email');
    if (!candidateData.phone) missingFields.push('phone');

    const newCandidate = new candidate(candidateData);
    const savedCandidate = await newCandidate.save();

    fs.unlinkSync(file.path);

    const response: createCandidateResponse = {
      success: true,
      data: savedCandidate,
      message: missingFields.length > 0 ? 'Candidate created but some fields are missing' : 'Candidate created successfully',
      missingFields
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error creating candidate:', error);
    
    if (req.file) {
      cleanupFile(req.file.path);
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to create candidate',
      statusCode: 500
    };
    
    res.status(500).json(errorResponse);
  }
};

export const getCandidateById = async (req: Request<CandidateDetailParams>, res: Response<getCandidateDetailsResponse | ErrorResponse>): Promise<void> => {
  try {
    const { id } = req.params;

    const candidateData = await candidate.findById(id);
    if (!candidateData) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Candidate not found',
        statusCode: 404
      });
      return;
    }

    const interviewData = await interview.findOne({ candidateId: id });
    
    const chatData = await Chat.find({ 
      interviewId: interviewData?._id 
    }).sort({ timestamp: 1 });

    const response: getCandidateDetailsResponse = {
      success: true,
      data: {
        candidate: candidateData,
        interview: interviewData || null,
        chats: chatData
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching candidate details:', error);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch candidate details',
      statusCode: 500
    };
    
    res.status(500).json(errorResponse);
  }
};