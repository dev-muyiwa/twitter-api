import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";

class TweetController {
    async createTweet(req: Request, res: Response) {
        try{
            return sendSuccessResponse(res, null, "Tweet created", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

}

export default TweetController;