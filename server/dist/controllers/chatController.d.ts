import { Request, Response } from "express";
import { createChatResponse, ErrorResponse } from "../types/api";
export declare const createChatMessage: (req: Request, res: Response<createChatResponse | ErrorResponse>) => Promise<void>;
export declare const getChatMessages: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=chatController.d.ts.map