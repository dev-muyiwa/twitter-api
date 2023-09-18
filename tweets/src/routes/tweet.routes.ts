import express, {Router} from "express";
import TweetController from "../controllers/tweet.controller";

const tweetRouter: Router = express.Router();
const tweetController: TweetController = new TweetController();

tweetRouter.post("/",tweetController.createTweet);
tweetRouter.get("/",tweetController.getTweets);

tweetRouter.get("/:tweetId", tweetController.getTweet);
tweetRouter.delete("/:tweetId", tweetController.deleteTweet);



export default tweetRouter;