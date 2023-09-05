import express, {Router} from "express";
import UserController from "../controller/user.controller";
import {checkAuthorizationToken} from "@dev-muyiwa/shared-service";

const userRouter: Router = express.Router();
const userController: UserController = new UserController();

userRouter.post("/:userId", checkAuthorizationToken, userController.getUser)

export default userRouter;