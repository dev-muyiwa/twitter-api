import express, { Application, Response, Request } from "express";
import authRouter from "./routes/auth.routes";

const app: Application = express();
const port: number = 3000;
app.get("/", (req: Request, res: Response) => {
    return res.send("A complete response from the auth service.");
});

app.use("/", authRouter);
app.listen(port, () => {
    console.log(`Listening to auth-service on port ${port}...`);
});