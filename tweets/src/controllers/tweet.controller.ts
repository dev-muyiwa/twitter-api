import {Request, Response} from "express";
import {AuthenticatedRequest, CustomError, sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";
import {TweetDocument, TweetModel} from "../models/tweet.model";
import axios, {AxiosResponse} from "axios";

class TweetController {
    // For every authenticated tweet, check if the user exists to get their ID.
    async createTweet(req: Request, res: Response) {
        try {
            let {parentId, content} = req.body;
            // Add media
            const response: AxiosResponse = await axios.get("http://account:3001/users/me", {
                validateStatus: null,
                headers: {
                    "Authorization": `${req.headers.authorization}`
                }
            });
            if (response.status !== 200) {
                throw new CustomError(response.data.message, response.status);
            }

            const {id} = response.data.data;
            const quotedTweet: TweetDocument | null = await TweetModel.findById(parentId);

            const tweet: TweetDocument = await TweetModel.create({
                parent: quotedTweet?.id,
                author: id,
                content: content
            });

            // separate quotes and retweets
            if (quotedTweet) {
                quotedTweet.stats.quotes += 1;
                await quotedTweet.save();
            }

            // Push notifications for tagged users

            return sendSuccessResponse(res, tweet, "Tweet created", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getTweets(req: Request, res: Response) {
        try {
            const {userId} = req.params;

            const tweets: TweetDocument[] = await TweetModel.find({author: userId, isDraft: false});
            // Paginate the tweets

            return sendSuccessResponse(res, tweets, "Tweets fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getDrafts(req: Request, res: Response) {
        try {
            const {userId} = req.params;

            const drafts: TweetDocument[] = await TweetModel.find({_id: userId, isDraft: true});

            return sendSuccessResponse(res, drafts, "Drafts fetched");
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