import express, { Application, Request, Response } from "express";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import config from "./config";
const app: Application = express();

app.use(cors({
    origin: [config.client_url],
    credentials: true
}))



app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});
export default app; 
