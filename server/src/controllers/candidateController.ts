import { Response, Request } from "express";
import mongoose from "mongoose";
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
  console.log('=== CREATE CANDIDATE FUNCTION CALLED ===');
  try {
    const file = req.file;
    
    // Check if file was uploaded
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
    
    // Handle different file types
    try {
      console.log('Processing file type:', file.mimetype);
      
      if (file.mimetype === 'application/pdf') {
        console.log('Reading PDF file...');
        const dataBuffer = fs.readFileSync(file.path);
        console.log('PDF buffer size:', dataBuffer.length);
        
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
        console.log('PDF text extracted successfully, length:', extractedText.length);
        console.log('First 200 chars:', extractedText.substring(0, 200));
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Handle DOCX files - for now, use basic extraction
        extractedText = `Uploaded DOCX file: ${file.originalname}`;
        console.log('DOCX file uploaded, basic processing applied');
      } else if (file.mimetype === 'text/plain') {
        extractedText = fs.readFileSync(file.path, 'utf8');
        console.log('Text file processed successfully');
      } else {
        console.log('Unknown file type, using basic fallback');
        extractedText = `Resume: ${file.originalname}\nName: \nEmail: \nPhone: `;
      }
      
      // Clean and validate extracted text
      if (!extractedText || extractedText.trim().length < 5) {
        console.warn('No meaningful text extracted, using fallback');
        extractedText = `Resume file uploaded: ${file.originalname}\nPlease provide your details manually.`;
      }
      
    } catch (fileError) {
      console.error('Error processing file:', fileError);
      extractedText = `Resume file: ${file.originalname}\nFile processing failed. Please provide your information manually.`;
    }

    console.log('Extracted text:', extractedText.substring(0, 200) + '...');

    // Extract fields using AI or regex (with proper error handling)
    let extractedFields;
    try {
      extractedFields = await extractFieldsAI(extractedText);
      console.log('Extraction successful:', extractedFields);
    } catch (aiError) {
      console.error('AI extraction failed completely, using fallback:', aiError);
      // Provide basic fallback data
      extractedFields = {
        name: { value: req.body.name || null, confidence: 0, source: 'manual' as const },
        email: { value: req.body.email || null, confidence: 0, source: 'manual' as const },
        phone: { value: req.body.phone || null, confidence: 0, source: 'manual' as const }
      };
    }

    const candidateData = {
      userId: (req as any).userId || new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Use auth userId or default for testing
      name: req.body.name || extractedFields.name.value || 'Unknown',
      email: req.body.email || extractedFields.email.value || 'unknown@example.com',
      phone: req.body.phone || extractedFields.phone.value || '0000000000',
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

    // Check for missing required fields
    const missingFields: string[] = [];
    if (!candidateData.name) missingFields.push('name');
    if (!candidateData.email) missingFields.push('email');
    if (!candidateData.phone) missingFields.push('phone');

    console.log('Creating candidate with data:', candidateData);

    const newCandidate = new candidate(candidateData);
    const savedCandidate = await newCandidate.save();

    console.log('Candidate saved successfully:', savedCandidate._id);

    // Clean up uploaded file after processing
    try {
      fs.unlinkSync(file.path);
      console.log('File cleaned up successfully');
    } catch (cleanupError) {
      console.error('Error cleaning up file:', cleanupError);
    }

    const response: createCandidateResponse = {
      success: true,
      data: savedCandidate,
      message: missingFields.length > 0 
        ? `Candidate created successfully! Please verify: ${missingFields.join(', ')}` 
        : 'Candidate created successfully with complete information!',
      missingFields
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error creating candidate:', error);
    
    // Clean up file if error occurs
    if (req.file) {
      try {
        await cleanupFile(req.file.path);
      } catch (cleanupError) {
        console.warn('Could not clean up file after error:', cleanupError);
      }
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? `Failed to process resume: ${error.message}` : 'Failed to create candidate. Please try again or contact support.',
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