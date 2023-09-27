import express, {Router} from "express";
import AuthController from "../controller/auth.controller";

const authRouter: Router = express.Router();
const authController: AuthController = new AuthController();


authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password/:resetToken", authController.resetPassword);
authRouter.post("/activate-account", authController.activateAccount);



export default authRouter