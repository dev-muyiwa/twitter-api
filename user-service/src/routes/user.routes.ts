import express, {Router} from "express";
import UserController from "../controller/user.controller";
import {checkAuthorizationToken} from "@dev-muyiwa/shared-service";

const userRouter: Router = express.Router();
const userController: UserController = new UserController();

// userRouter.get("/:userId", checkAuthorizationToken, userController.getUser)
userRouter.get("/:userId", userController.getUser)

// Internal routes
userRouter.get("/internal/:email", userController.getUserByEmail);

export default userRouter;