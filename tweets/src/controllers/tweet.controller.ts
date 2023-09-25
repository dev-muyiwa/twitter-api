import {Request, Response} from "express";
import {AuthenticatedRequest, CustomError, sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";
import {TweetDocument, TweetModel} from "../models/tweet.model";
import axios, {AxiosResponse} from "axios";
import {BookmarkDocument, BookmarkModel} from "../models/bookmark.model";
import mongoose from "mongoose";

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

            if (userId !== id) {
                throw new CustomError("Unable to access this resource", CustomError.FORBIDDEN);
            }

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

    async deleteTweet(req: Request, res: Response) {
        try {
            const {tweetId} = req.params;
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
            const tweet: TweetDocument | null = await TweetModel.findOneAndDelete({_id: tweetId, author: id});

            if (!tweet) {
                throw new CustomError("Unable to delete tweet", CustomError.BAD_REQUEST);
            }
            return sendSuccessResponse(res, null, "Tweet deleted");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async addTweetToBookmarks(req: Request, res: Response) {
        try {
            const {tweetId} = req.params;
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

            let bookmark: BookmarkDocument | null = await BookmarkModel.findOne({user: id});
            if (!bookmark) {
                bookmark = await BookmarkModel.create({user: id});
            }

            if (!bookmark.tweets.includes(new mongoose.Types.ObjectId(tweetId))) {
                await bookmark.updateOne({
                    $push: {tweets: tweetId}
                });
                return sendSuccessResponse(res, null, "Tweet added to bookmarks", 201);
            } else {
                return sendSuccessResponse(res, null, "Tweet is already in bookmarks", 200);
            }
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async removeTweetFromBookmarks(req: Request, res: Response) {
        try {
            const {tweetId} = req.params;
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

            let bookmark: BookmarkDocument | null = await BookmarkModel.findOne({user: id});
            if (!bookmark) {
                bookmark = await BookmarkModel.create({user: id});
            }

            if (!bookmark.tweets.includes(new mongoose.Types.ObjectId(tweetId))) {
                return sendSuccessResponse(res, null, "Tweet is not in bookmarks", 200);
            } else {
                await bookmark.updateOne({
                    $pull: {tweets: tweetId}
                });
                return sendSuccessResponse(res, null, "Tweet removed from bookmarks", 200);
            }
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getBookmarks(req: Request, res: Response) {
        try {
            const {userId} = req.params;
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
            if (id !== userId) {
                throw new CustomError("Unable to access this resource", CustomError.FORBIDDEN);
            }

            const bookmarks: BookmarkDocument[] = await BookmarkModel.find({user: id});

            return sendSuccessResponse(res, bookmarks, "Bookmarks fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }
}

export default TweetController;