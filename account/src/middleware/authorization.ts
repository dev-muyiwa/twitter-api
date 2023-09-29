import {Response, NextFunction} from "express";
import {AuthenticatedRequest, CustomError, sendErrorResponse} from "@dev-muyiwa/shared-service";
import {UserDocument} from "../model/user.model";
import {findUserBy} from "../service/user.service";
import {redisClient, redisGet, redisSet} from "../index";

const authorizeToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const user: UserDocument = await findUserBy(req.userId);
        // const cachedAuthUser = await redisGet(`user:${req.userId}`);
        console.log("Checkpoint A")

        // const user: UserDocument = cachedAuthUser ? JSON.parse(cachedAuthUser) : await findUserBy(req.userId);
        console.log("Checkpoint B")

        if (!user.refreshToken) {
            throw new CustomError(`User has no refresh token`);
        }
        if (!user.isVerified) {
            throw new CustomError("Account not yet activated", CustomError.FORBIDDEN);
        }

        // store to redis
        await redisClient.setEx(`user:${user.id}`, 7200, JSON.stringify(user));
        // await redisSet(`user:${user.id}g`, 7200, JSON.stringify(user.getDetailedInfo()));
        console.log("Checkpoint C")


        return next();
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const verifyResourceAuthor = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const {userId} = req.params;

        if (req.userId != userId) {
            throw new CustomError("Unable to access/modify this resource", CustomError.FORBIDDEN);
        }

        return next();
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

export {authorizeToken, verifyResourceAuthor};