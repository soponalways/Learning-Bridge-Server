import express, { Application, Request, Response } from "express";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
const app: Application = express();

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});


app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));


export default app; 
