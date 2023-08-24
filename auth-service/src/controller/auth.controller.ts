import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";

class AuthController {
    async register(req: Request, res: Response): Promise<Response> {
        try{
            const {firstName, lastName, email, mobile, password} = req.body;
            return sendSuccessResponse(res, {name: "Registration"}, "Registration successful.", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async login(req: Request, res: Response): Promise<Response> {

        return sendSuccessResponse(res, {name: "Login"}, "A test response from login endpoint.");
    }
}

export default AuthController;