import express, {Router} from "express";
import UserController from "../controller/user.controller";
import {checkAuthorizationToken} from "@dev-muyiwa/shared-service";
import {authorizeToken} from "../middleware/authorization";

const userRouter: Router = express.Router();
const userController: UserController = new UserController();

userRouter.post("/:userId/token", userController.generateAccessToken);


userRouter.use(checkAuthorizationToken, authorizeToken);

userRouter.get("/:userId", userController.getUser);
userRouter.put("/me", userController.updateUser);
userRouter.patch("/me", userController.updatePassword);

userRouter.get("/:userId/tweets", userController.getTweets);
// userRouter.get("/:userId/drafts", verifyResourceAuthor, userController.getDrafts);
userRouter.get("/me/drafts", userController.getDrafts);
userRouter.get("/me/bookmarks", userController.getBookmarks);

userRouter.get("/:userId/followers", userController.getFollowers);
userRouter.get("/:userId/followings", userController.getFollowings);
userRouter.post("/:userId/follow", userController.followHandle);
userRouter.post("/:userId/unfollow", userController.unfollowHandle);


export default userRouter;