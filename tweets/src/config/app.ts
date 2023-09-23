import express, {Application} from "express";
import tweetRouter from "../routes/tweet.routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("", tweetRouter);


export default app;