import express, {Application} from "express";
import followingsRouter from "../routes/followings.routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("", followingsRouter);


export default app;