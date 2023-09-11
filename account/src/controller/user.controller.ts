import {Response} from "express";
import {AuthenticatedRequest, CustomError, sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";
import {UserDocument} from "../model/user.model";
import {findUser, findUserBy} from "../service/user.service";
import bcrypt from "bcrypt";
import axios, {AxiosResponse} from "axios"
import {config} from "../config/config";

class UserController {
    async getUser(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const {handle} = req.params;
            const user: UserDocument = await findUser(handle);
            // Get the following_count, follower_count and other things.


            let data: {} = {};
            if (user.id !== req.userId) {
                const response: AxiosResponse = await axios.post(`http://followings:3003/${user.id}/following-status`, {followerId: req.userId});
                data = response.data.data;
            }

            return sendSuccessResponse(res, {...user.getDetailedInfo(), ...data}, "User fetched")
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async updateUser(req: AuthenticatedRequest, res: Response) {
        try {
            const {firstName, lastName, displayName, bio} = req.body;
            const user: UserDocument = await findUserBy(req.userId);

            if (user.handle !== req.params.handle) {
                throw new CustomError("Unable to modify this resource", CustomError.FORBIDDEN);
            }

            await user.updateOne({
                firstName: firstName ?? user.firstName,
                lastName: lastName ?? user.lastName,
                displayName: displayName ?? user.displayName,
                bio: bio ?? user.bio
            });

            return sendSuccessResponse(res, user.getBasicInfo(), "Profile updated");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async updatePassword(req: AuthenticatedRequest, res: Response) {
        try {
            const {currentPassword, newPassword} = req.body;
            const user: UserDocument = await findUserBy(req.userId);

            if (user.handle !== req.params.handle) {
                throw new CustomError("Unable to modify user password", CustomError.FORBIDDEN);
            }

            if (currentPassword === newPassword) {
                throw new CustomError("New password cannot be same as current password", CustomError.BAD_REQUEST);
            }

            if (!await bcrypt.compare(currentPassword, user.passwordHash)) {
                throw new CustomError("Current password doesn't match existing password", CustomError.BAD_REQUEST);
            }

            await user.updateOne({
                password: await bcrypt.hash(newPassword, config.server.bcrypt_rounds)
            })

            return sendSuccessResponse(res, null, "Password updated");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getFollowers(req: AuthenticatedRequest, res: Response) {
        try {
            const {handle} = req.params
            const followedUser: UserDocument = await findUser(handle);

            const response: AxiosResponse = await axios.get(`http://followings:3003/${followedUser.id}/followers`);

            if (response.status !== 200) {
                throw new CustomError(response.data.message, response.status);
            } else {
                return sendSuccessResponse(res, response.data.data, response.data.message, response.status);
            }
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getFollowings(req: AuthenticatedRequest, res: Response) {
        try {
            const {handle} = req.params
            const followedUser: UserDocument = await findUser(handle);

            const response: AxiosResponse = await axios.get(`http://followings:3003/${followedUser.id}/followings`);

            if (response.status !== 200) {
                throw new CustomError(response.data.message, response.status);
            } else {
                return sendSuccessResponse(res, response.data.data, response.data.message, response.status);
            }
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async followHandle(req: AuthenticatedRequest, res: Response) {
        try {
            const {handle} = req.params
            const followedUser: UserDocument = await findUser(handle);
            const authUser: UserDocument = await findUserBy(req.userId);
            if (followedUser.id == authUser.id) {
                throw new CustomError("Unable to follow yourself", CustomError.BAD_REQUEST);
            }

            const response: AxiosResponse = await axios.post(`http://followings:3003/${authUser.id}/follow`,
                {followingId: followedUser.id});
            if (response.status !== 201) {
                throw new CustomError(response.data.message, response.status);
            } else {
                return sendSuccessResponse(res, response.data.data, response.data.message, response.status);
            }
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async unfollowHandle(req: AuthenticatedRequest, res: Response) {
        try {
            const {handle} = req.params
            const followedUser: UserDocument = await findUser(handle);
            const authUser: UserDocument = await findUserBy(req.userId);
            if (followedUser.id == authUser.id) {
                throw new CustomError("Unable to unfollow yourself", CustomError.BAD_REQUEST);
            }

            const response = await axios.post(`http://followings:3003/${authUser.id}/unfollow`, {followingId: followedUser.id});
            console.log("Response:", response.data);
            if (response.status !== 201) {
                throw new CustomError(response.data.message, response.status);
            } else {
                return sendSuccessResponse(res, response.data.data, response.data.message, response.status);
            }
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }
}

export default UserController;