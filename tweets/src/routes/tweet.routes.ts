import express, {Router} from "express";
import TweetController from "../controllers/tweet.controller";
import {checkAuthorizationToken} from "@dev-muyiwa/shared-service";

const tweetRouter: Router = express.Router();
const tweetController: TweetController = new TweetController();

tweetRouter.post("/", tweetController.createTweet); // Make route protected

tweetRouter.get("/:userId/tweets",tweetController.getTweets);
tweetRouter.get("/:userId/drafts",tweetController.getDrafts);

tweetRouter.get("/:tweetId", tweetController.getTweet);
tweetRouter.delete("/:tweetId", tweetController.deleteTweet); // and this too



export default tweetRouter;