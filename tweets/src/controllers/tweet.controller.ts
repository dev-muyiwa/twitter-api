import {Request, Response} from "express";
import {CustomError, sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";
import {TweetDocument, TweetModel} from "../models/tweet.model";
import axios, {AxiosResponse} from "axios";
import {BookmarkDocument, BookmarkModel} from "../models/bookmark.model";
import mongoose from "mongoose";


class TweetController {
    async createTweet(req: Request, res: Response) {
        try {
            let {parentId, content, isDraft} = req.body;
            // const medias: Express.Multer.File[] | undefined = req.files as Express.Multer.File[];

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

            // if (medias) {
            //     if (medias.length > 4) {
            //         throw new CustomError("A maximum of 4 images/videos are allowed", CustomError.BAD_REQUEST);
            //     }
            //
            //     medias.forEach(media => {
            //         if (!media || (!media.mimetype.startsWith("image/") && !media.mimetype.startsWith("video/"))) {
            //             throw new CustomError("Only images and videos are supported", CustomError.BAD_REQUEST);
            //         }
            //     });
            //
            //
            // }


            // Upload to cloudinary

            const tweet: TweetDocument = await TweetModel.create({
                parent: quotedTweet?.id,
                author: id,
                content: content,
                isDraft: isDraft == "true"
            });

            if (quotedTweet && !tweet.isDraft) {
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

            const response: AxiosResponse = await axios.get("http://account:3001/users/me", {
                validateStatus: null,
                headers: {
                    "Authorization": `${req.headers.authorization}`
                }
            });
            if (response.status !== 200) {
                throw new CustomError(response.data.message, response.status);
            }

            const {page} = req.query
            const p: number = (Number(page)) ? Number(page) : 1;

            const tweets = await TweetModel.paginate({author: userId, isDraft: false}, {
                page: p,
                limit: 15,
                customLabels: {
                    limit: false,
                    page: 'currentPage',
                    docs: 'tweets',
                    nextPage: 'next',
                    prevPage: 'prev',
                    totalPages: 'totalPages',
                    totalDocs: false,
                    pagingCounter: false,
                    meta: false,
                    hasNextPage: false,
                    hasPrevPage: false
                },
                sort: "-timestamp",
                populate: "parent"
            });

            return sendSuccessResponse(res, tweets, "Tweets fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getDrafts(req: Request, res: Response) {
        try {

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

            const {page} = req.query;
            const p: number = (Number(page)) ? Number(page) : 1;

            const drafts = await TweetModel.paginate({author: id, isDraft: true}, {
                page: p,
                limit: 15,
                customLabels: {
                    limit: false,
                    page: 'currentPage',
                    docs: 'drafts',
                    nextPage: 'next',
                    prevPage: 'prev',
                    totalPages: 'totalPages',
                    totalDocs: false,
                    pagingCounter: false,
                    meta: false,
                    hasNextPage: false,
                    hasPrevPage: false
                },
                sort: "-timestamp",
                populate: "parent"
            });

            return sendSuccessResponse(res, drafts, "Drafts fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getTweet(req: Request, res: Response) {
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

            const tweet: TweetDocument | null = await TweetModel.findById(tweetId);
            if (!tweet) {
                throw new CustomError("Tweet does not exist");
            }

            if (!tweet.author.equals(id)) {
                tweet.stats.views += 1;
                await tweet.save();
            }

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

            const tweet: TweetDocument | null = await TweetModel.findById(tweetId);

            if (!tweet) {
                throw new CustomError("Tweet does not exist", CustomError.NOT_FOUND);
            }

            let bookmark: BookmarkDocument | null = await BookmarkModel.findOne({user: id, tweet: tweet.id});
            if (!bookmark) {
                await BookmarkModel.create({
                    user: id,
                    tweet: tweetId
                })

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

            const tweet: TweetDocument | null = await TweetModel.findById(tweetId);

            if (!tweet) {
                throw new CustomError("Tweet does not exist", CustomError.NOT_FOUND);
            }

            const bookmark: BookmarkDocument | null = await BookmarkModel.findOneAndDelete({user: id, tweet: tweet.id});
            if (!bookmark) {
                throw new CustomError("Tweet isn't bookmarked");
            }

            return sendSuccessResponse(res, null, "Tweet removed from bookmarks", 200);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getBookmarks(req: Request, res: Response) {
        try {
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
            const {page} = req.query;
            const p: number = (Number(page)) ? Number(page) : 1;

            const bookmarks = await BookmarkModel.paginate({user: id}, {
                page: p,
                limit: 15,
                customLabels: {
                    limit: false,
                    page: 'currentPage',
                    docs: 'bookmarks',
                    nextPage: 'next',
                    prevPage: 'prev',
                    totalPages: 'totalPages',
                    totalDocs: false,
                    pagingCounter: false,
                    meta: false,
                    hasNextPage: false,
                    hasPrevPage: false
                },
                sort: "-timestamp",
                populate: "parent"
            });

            return sendSuccessResponse(res, bookmarks, "Bookmarks fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }
}

export default TweetController;