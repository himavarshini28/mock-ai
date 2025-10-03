import { Response, Request } from "express";
import { candidateListQuery, getCandidateResponse, ErrorResponse, createCandidateResponse, CandidateDetailParams, getCandidateDetailsResponse } from "../types/api";
import { upload, validateFileUpload } from "../utils/fileValidation";
export { upload, validateFileUpload };
export declare const getCandidates: (req: Request<{}, getCandidateResponse, {}, candidateListQuery>, res: Response<getCandidateResponse | ErrorResponse>) => Promise<void>;
export declare const createCandidate: (req: Request, res: Response<createCandidateResponse | ErrorResponse>) => Promise<void>;
export declare const getCandidateById: (req: Request<CandidateDetailParams>, res: Response<getCandidateDetailsResponse | ErrorResponse>) => Promise<void>;
//# sourceMappingURL=candidateController.d.ts.map