import {Request, Response} from "express";
import {AuthenticatedRequest, CustomError, sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";
import {TweetDocument, TweetModel} from "../models/tweet.model";

class TweetController {
    async createTweet(req: AuthenticatedRequest, res: Response) {
        try{
            return sendSuccessResponse(res, null, "Tweet created", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getTweets(req: Request, res: Response) {
        try{
            const {userId} = req.params;
            const tweets: TweetDocument[] = await TweetModel.find({_id: userId, isDraft: false});
            return sendSuccessResponse(res, tweets, "Tweets fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getDrafts(req: AuthenticatedRequest, res: Response) {
        try{
            const {userId} = req.params;
            const drafts: TweetDocument[] = await TweetModel.find({_id: userId, isDraft: true});
            return sendSuccessResponse(res, drafts, "Drafts fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getTweet(req: Request, res: Response) {
        try{
            const {tweetId} = req.params;
            const tweet: TweetDocument|null = await TweetModel.findById(tweetId);
            if (!tweet) {
                throw new CustomError("Tweet does not exist");
            }

            // Increment the view count

            return sendSuccessResponse(res, tweet, "Tweet fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async deleteTweet(req: AuthenticatedRequest, res: Response) {
        try{
            const {tweetId} = req.params;
            const tweet: TweetDocument|null = await TweetModel.findOneAndDelete({_id: tweetId, author: req.userId});

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