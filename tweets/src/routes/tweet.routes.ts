import express, {Router} from "express";
import TweetController from "../controllers/tweet.controller";
import {checkAuthorizationToken} from "@dev-muyiwa/shared-service";

const tweetRouter: Router = express.Router();
const tweetController: TweetController = new TweetController();

tweetRouter.post("/", tweetController.createTweet);

tweetRouter.get("/:userId/tweets",tweetController.getTweets);
tweetRouter.get("/me/drafts",tweetController.getDrafts);
tweetRouter.get("/me/bookmarks", tweetController.getBookmarks);

tweetRouter.get("/:tweetId", tweetController.getTweet);
tweetRouter.delete("/:tweetId", tweetController.deleteTweet);

tweetRouter.post("/:tweetId/bookmark", tweetController.addTweetToBookmarks);
tweetRouter.delete("/:tweetId/bookmark", tweetController.removeTweetFromBookmarks);



export default tweetRouter;