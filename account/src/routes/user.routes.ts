import express, {Router} from "express";
import UserController from "../controller/user.controller";
import {checkAuthorizationToken} from "@dev-muyiwa/shared-service";
import {authorizeToken} from "../middleware/authorization";

const userRouter: Router = express.Router();
const userController: UserController = new UserController();

userRouter.use(checkAuthorizationToken, authorizeToken);


userRouter.get("/:handle", userController.getUser);
userRouter.put("/:handle", userController.updateUser);
userRouter.patch("/:handle", userController.updatePassword);

userRouter.get("/:handle/followers", userController.getFollowers);
userRouter.get("/:handle/followings", userController.getFollowings);

userRouter.post("/:handle/follow", userController.followHandle);
userRouter.post("/:handle/unfollow", userController.unfollowHandle);



export default userRouter;