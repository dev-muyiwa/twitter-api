import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";
import {FollowingDocument, FollowingModel} from "../models/followings.model";

class FollowingsController {

    async checkFollowingStatus(req: Request, res: Response) {
        try {
            const {userId} = req.params;
            const {followerId} = req.body;

            const existingRelationship = await FollowingModel.exists({user: followerId, following: userId});
            const reverseRelationship = await FollowingModel.exists({user: userId, following: followerId});
            const followers: number = await FollowingModel.count({following: userId});
            const followings: number = await FollowingModel.count({user: userId});

            const data: object = {
                isFollowing: existingRelationship !== null,
                isFollower: reverseRelationship !== null,
                followers: followers,
                followings: followings
            }
            return sendSuccessResponse(res, data, "Following status");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getFollowers(req: Request, res: Response) {
        try {
            const {page} = req.query;
            const p: number = (Number(page)) ? Number(page) : 1;

            const {userId} = req.params;

            const followers = await FollowingModel.paginate({following: userId}, {
                page: p,
                limit: 15,
                customLabels: {
                    limit: false,
                    page: 'currentPage',
                    docs: 'followers',
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
            });

            return sendSuccessResponse(res, followers, "Followers fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getFollowings(req: Request, res: Response) {
        try {
            const {page} = req.query;
            const p: number = (Number(page)) ? Number(page) : 1;

            const {userId} = req.params;
            const followings = await FollowingModel.paginate({user: userId}, {
                page: p,
                limit: 15,
                customLabels: {
                    limit: false,
                    page: 'currentPage',
                    docs: 'followings',
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
            });

            return sendSuccessResponse(res, followings, "Followings fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async followHandle(req: Request, res: Response) {
        try {
            const {userId} = req.params;
            const {followingId} = req.body;

            // Check if the 2 users exists
            // const firstUser = await axios.get("http://account:3001/users/")

            const existingRelationship: FollowingDocument | null = await FollowingModel.findOne({
                user: userId,
                following: followingId
            })

            if (!existingRelationship) {
                await FollowingModel.create({
                    user: userId,
                    following: followingId
                })
            }

            // Send a push notification to the followed user

            return sendSuccessResponse(res, null, "Handle followed", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async unfollowHandle(req: Request, res: Response) {
        try {
            const {userId} = req.params;
            const {followingId} = req.body;

            await FollowingModel.findOneAndDelete({
                user: userId,
                following: followingId
            })

            return sendSuccessResponse(res, null, "Handle unfollowed");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }
}

export default FollowingsController;