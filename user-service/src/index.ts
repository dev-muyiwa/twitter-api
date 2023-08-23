import express, { Application, Response, Request } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
    return res.send("A complete response from the user service.");
});

app.listen(3001, () => {
    console.log("Listening to user-service on port 3001...");
})