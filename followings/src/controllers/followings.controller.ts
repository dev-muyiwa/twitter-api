import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";
import {FollowingDocument, FollowingModel} from "../models/followings.model";

class FollowingsController {

    async getFollowers(req: Request, res: Response) {
        try {
            const {userId} = req.params;
            const followers: FollowingDocument[] = await FollowingModel.find({following: userId});

            return sendSuccessResponse(res, followers, "Followers fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getFollowings(req: Request, res: Response) {
        try {
            const {userId} = req.params;
            const followings: FollowingDocument[] = await FollowingModel.find({user: userId});

            return sendSuccessResponse(res, followings, "Followings fetched");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async followHandle(req: Request, res: Response) {
        try {
            const {userId} = req.params;
            const {followingId} = req.body;

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