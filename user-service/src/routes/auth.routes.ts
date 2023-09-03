import express, {Router} from "express";
import AuthController from "../controller/auth.controller";

const authRouter: Router = express.Router();
const authController: AuthController = new AuthController();


authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);


export default authRouter