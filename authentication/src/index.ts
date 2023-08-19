import express, { Application, Response, Request } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
    return res.send("A complete response from the authentication service (modified).");
});

app.listen(3000, () => {
    console.log("Listening on port 3000...");
});