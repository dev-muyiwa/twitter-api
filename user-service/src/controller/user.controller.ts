import {Request, Response} from "express";
import {AuthenticatedRequest, CustomError, sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";
import {UserDocument, UserModel} from "../model/user.model";

class UserController {
    async getUser(req: Request, res: Response): Promise<Response> {
        try {
            const authUser: UserDocument | null = await UserModel.findById(req.params.userId);
            if (!authUser) {
                throw new CustomError("User does not exist");
            }

            return sendSuccessResponse(res, authUser.getBasicInfo(), "User fetched")
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async getUserByEmail(req: Request, res: Response) {
        const user: UserDocument | null = await UserModel.findOne({email: req.params.email});
        if (!user) {
            const err: CustomError = new CustomError("User does not exist");
            return sendErrorResponse(res, err);
        }
        return sendSuccessResponse(res, user.getBasicInfo(), "User fetched")
    }

    async updateUser(req: AuthenticatedRequest, res: Response) {
        try {
            const {firstName, lastName, displayName, bio} = req.body;
            const user: UserDocument | null = await UserModel.findById(req.userId);
            if (!user) {
                throw new CustomError("User does not exist");
            }
            if (user.id !== req.params.userId) {
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
}

export default UserController;