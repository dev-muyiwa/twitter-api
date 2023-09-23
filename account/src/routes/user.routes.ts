import express, {Router} from "express";
import UserController from "../controller/user.controller";
import {checkAuthorizationToken} from "@dev-muyiwa/shared-service";
import {authorizeToken, verifyResourceAuthor} from "../middleware/authorization";

const userRouter: Router = express.Router();
const userController: UserController = new UserController();

userRouter.use(checkAuthorizationToken, authorizeToken);


userRouter.get("/:userId", userController.getUser);

// Create a middleware that compares the id
userRouter.put("/:userId", verifyResourceAuthor, userController.updateUser);
userRouter.patch("/:userId", verifyResourceAuthor, userController.updatePassword);

userRouter.get("/:userId/followers", userController.getFollowers);
userRouter.get("/:userId/followings", userController.getFollowings);

userRouter.post("/:userId/follow", userController.followHandle);
userRouter.post("/:userId/unfollow", userController.unfollowHandle);

userRouter.get("/:userId/tweets", userController.getTweets);
userRouter.get("/:userId/drafts", verifyResourceAuthor, userController.getDrafts);


export default userRouter;