import {Response, NextFunction} from "express";
import {AuthenticatedRequest, CustomError, sendErrorResponse} from "@dev-muyiwa/shared-service";
import {UserDocument} from "../model/user.model";
import {findUserBy} from "../service/user.service";

const authorizeToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const user: UserDocument = await findUserBy(req.userId);
        if (!user.refreshToken) {
            throw new CustomError(`User has no refresh token`);
        }
        if (!user.isVerified) {
            throw new CustomError("Account not yet activated", CustomError.FORBIDDEN);
        }

        return next();
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

export {authorizeToken};