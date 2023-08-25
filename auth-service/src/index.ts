import express, { Application, Response, Request } from "express";
import authRouter from "./routes/auth.routes";
import {Kafka} from "kafkajs";

const app: Application = express();
const port: number = Number(process.env.PORT);
app.get("/", (req: Request, res: Response) => {
    return res.send("A complete response from the auth service.");
});

app.use("/", authRouter);
app.listen(port, async () => {
    console.log(`Listening to auth-service on port ${port}...`);
});