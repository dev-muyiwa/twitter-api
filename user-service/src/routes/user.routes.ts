import express, {Router} from "express";
import UserController from "../controller/user.controller";

const userRouter: Router = express.Router();
const userController: UserController = new UserController();


export default userRouter;