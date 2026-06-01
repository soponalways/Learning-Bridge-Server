import { Router, Request, Response } from 'express';
import os from 'os';
import { prisma } from '../lib/prisma';

const router: Router = Router();

// Strict typing for deep analytics
interface ServiceStatus {
  status: 'UP' | 'DOWN';
  latencyMs?: number;
  error?: string;
}

interface SystemAnalytics {
  uptimeSeconds: number;
  timestamp: string;
  nodeVersion: string;
  platform: string;
  architecture: string;
  memory: {
    freeBytes: number;
    totalBytes: number;
    usagePercentage: string;
    processHeapUsedBytes: number;
  };
  cpu: {
    model: string;
    cores: number;
    loadAverage15Min: number[];
  };
}

interface DeepHealthResponse {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  analytics: SystemAnalytics;
  dependencies: {
    database: ServiceStatus;
    redis?: ServiceStatus; // Optional: Add if using caching
  };
}

const checkDatabaseConnection = async (): Promise<{ up: boolean; latency: number }> => {
  const start = performance.now();
  try {
    await prisma.$connect(); // Ensure connection is established
    const end = performance.now();
    return { up: true, latency: Math.round(end - start) };
  } catch (error) {
    return { up: false, latency: 0 };
  }
};

router.get('/health/deep', async (req: Request, res: Response): Promise<void> => {
  const startTime = performance.now();

  // 1. Fetch Dependency Statuses
  const dbCheck = await checkDatabaseConnection();

  // 2. Calculate System Memory Data
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);

  // 3. Determine Overall Application Status
  let overallStatus: 'UP' | 'DEGRADED' | 'DOWN' = 'UP';
  if (!dbCheck.up) {
    overallStatus = 'DOWN'; // Critical dependency failure
  } else if (parseFloat(memUsagePercent) > 90) {
    overallStatus = 'DEGRADED'; // System resource exhaustion warning
  }

  const deepHealthReport: DeepHealthResponse = {
    status: overallStatus,
    analytics: {
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: os.platform(),
      architecture: os.arch(),
      memory: {
        freeBytes: freeMem,
        totalBytes: totalMem,
        usagePercentage: `${memUsagePercent}%`,
        processHeapUsedBytes: process.memoryUsage().heapUsed,
      },
      cpu: {
        model: os.cpus()[0]?.model || 'Unknown',
        cores: os.cpus().length,
        loadAverage15Min: os.loadavg(), // Returns 1, 5, and 15 min load averages
      },
    },
    dependencies: {
      database: {
        status: dbCheck.up ? 'UP' : 'DOWN',
        latencyMs: dbCheck.latency,
      },
    },
  };

  // 4. Set Smart HTTP Status Codes for Load Balancers (Kubernetes, AWS Route53)
  if (overallStatus === 'DOWN') {
    res.status(503).json(deepHealthReport);
    return;
  }

  // Set header to show processing latency of the health check itself
  res.setHeader('X-Health-Check-Duration-Ms', Math.round(performance.now() - startTime));
  res.status(200).json(deepHealthReport);
});

const healthRouter = router;
export default healthRouter;
