import express, { Application, Response, Request } from "express";
import authRouter from "./routes/auth.routes";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
    return res.send("A complete response from the auth service.");
});

app.use("/", authRouter);

app.listen(3000, () => {
    console.log("Listening to auth-service on port 3000...");
});