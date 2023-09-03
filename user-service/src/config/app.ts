import express, {Application} from "express";
import authRouter from "../routes/auth.routes";
import userRouter from "../routes/user.routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/auth", authRouter);
app.use("/users", userRouter);


export default app;