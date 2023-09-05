import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";

class UserController {
    async getUser(req: Request, res: Response) {
        try{
            return sendSuccessResponse(res, {data: "kage bunshin"}, "User fetched")
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async updateUser(req: Request, res: Response) {
        try{

        } catch (err) {

        }
    }
}

export default UserController;