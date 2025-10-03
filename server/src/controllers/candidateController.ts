import { Response, Request } from "express";
import { candidate } from "../models/candidate";
import { candidateListQuery, getCandidateResponse, ErrorResponse } from "../types/api";

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
}