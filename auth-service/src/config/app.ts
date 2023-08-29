import express, {Application} from "express";
import authRouter from "../routes/auth.routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/", authRouter);

export default app;