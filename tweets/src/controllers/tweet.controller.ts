import {Request, Response} from "express";
import {AuthenticatedRequest, CustomError, sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";
import {TweetDocument, TweetModel} from "../models/tweet.model";

class TweetController {
    // For every authenticated tweet, check if the user exists to get their ID.
    async createTweet(req: AuthenticatedRequest, res: Response) {
        try {
            // Check if a user with refresh token exists within the database
            return sendSuccessResponse(res, null, "Tweet created", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getTweets(req: Request, res: Response) {
        try {
            const {userId} = req.params;
            const {isDraft} = req.query;

            const message: string = (isDraft == "true") ? "Tweets fetched" : "Drafts fetched";

            const tweets: TweetDocument[] = (isDraft == "true") ?
                await TweetModel.find({_id: userId, isDraft: true}) :
                await TweetModel.find({_id: userId, isDraft: false});

            return sendSuccessResponse(res, tweets, message);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getTweet(req: Request, res: Response) {
        try {
            const {tweetId} = req.params;
            const tweet: TweetDocument | null = await TweetModel.findById(tweetId);
            if (!tweet) {
                throw new CustomError("Tweet does not exist");
            }

            // Increment the view count if the viewer is unique

            return sendSuccessResponse(res, tweet, "Tweet fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async deleteTweet(req: AuthenticatedRequest, res: Response) {
        try {
            const {tweetId} = req.params;
            const tweet: TweetDocument | null = await TweetModel.findOneAndDelete({_id: tweetId, author: req.userId});

            if (!tweet) {
                throw new CustomError("Tweet does not exist");
            }
            return sendSuccessResponse(res, null, "Tweet deleted");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }
}

export default TweetController;