import express, {Router} from "express";
import TweetController from "../controllers/tweet.controller";

const tweetRouter: Router = express.Router();
const tweetController: TweetController = new TweetController();





export default tweetRouter;