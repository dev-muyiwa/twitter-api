import {Request, Response} from "express";
import {CustomError} from "../utils/CustomError";
import {UserDocument} from "../model/user.model";


interface AuthenticatedRequest extends Request {
    user?: UserDocument
}


const errorResponse = (res: Response, error: any, message: string, code: number = 500): Response => {
    return res.status(code).json({success: false, error: error, message: message});
}

const sendSuccessResponse = (res: Response, data: any, message: string, code: number = 200): Response => {
    return res.status(code).json({success: true, data: data, message: message});
}

const sendErrorResponse = (res: Response, err: any, message?: string): Response => {
    if (err instanceof CustomError) {
        return errorResponse(res, null, err.message, err.code)
    } else {
        return errorResponse(res, err, message ?? err.message);
    }
}

export {sendSuccessResponse, sendErrorResponse, AuthenticatedRequest};