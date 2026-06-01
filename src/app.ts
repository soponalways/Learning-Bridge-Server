import express, { Application, Request, Response } from "express";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import config from "./config";
import healthRouter from "./routes/health.route";
const app: Application = express();

app.use(cors({
  origin: [config.client_url],
  credentials: true
}))



app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));


// Define a TypeScript interface for the health response structure
interface HealthCheckResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  uptime: number;
  memoryUsage: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
  };
}

// Health Check API route handler
app.get('/health', (req: Request, res: Response): void => {
  try {
    const memory = process.memoryUsage();

    const healthData: HealthCheckResponse = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(), // Server uptime in seconds
      memoryUsage: {
        rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


app.use(healthRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});
export default app; 
