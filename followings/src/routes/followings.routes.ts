import express, {Router} from "express";
import FollowingsController from "../controllers/followings.controller";

const followingsRouter: Router = express.Router();
const followingsController: FollowingsController = new FollowingsController();

followingsRouter.get("/:userId/followers", followingsController.getFollowers);
followingsRouter.get("/:userId/followings", followingsController.getFollowings);
followingsRouter.post("/:userId/follow", followingsController.followHandle);
followingsRouter.post("/:userId/unfollow", followingsController.unfollowHandle);

export default followingsRouter;