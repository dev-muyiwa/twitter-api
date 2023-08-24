import {Router} from "express";
import AuthController from "../controller/auth.controller";

const authRouter = Router();

const authController = new AuthController();

authRouter.get("/register", authController.register);
authRouter.get("/login", authController.login);

export default authRouter;