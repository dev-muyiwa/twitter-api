import {Router} from "express";
import AuthController from "../controller/auth.controller";
import {check} from "express-validator";
import {CustomError} from "../utils/CustomError";
import {isEmail, isMobilePhone} from "class-validator";

const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/forgot-password", authController.forgotPassword);

export default authRouter;