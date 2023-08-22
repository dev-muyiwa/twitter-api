import express, { Application, Response, Request } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
    return res.send("A complete response from the authentication (modified).");
});

app.get("/register", (req: Request, res: Response) => {
    return res.send("Hello from the register endpoint.");
});

app.post("/login", (req: Request, res: Response) => {
    return res.send("Hello from the login endpoint.");
});

app.listen(3000, () => {
    console.log("Listening on port 3000...");
});