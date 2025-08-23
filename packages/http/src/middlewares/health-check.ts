import { AppContext } from '@blitzbun/core';

import {
  HttpMiddleware,
  HttpRequestContract,
  HttpResponseContract,
  HttpStatusCode,
} from '@blitzbun/contracts';

export interface HealthCheckOptions {
  path?: string;
  readinessPath?: string;
  includeSystemInfo?: boolean;
  includeMemoryUsage?: boolean;
  customChecks?: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  check: () => Promise<{
    message?: string;
    status: 'pass' | 'fail';
    [key: string]: unknown;
  }>;
}

export interface HealthStatus {
  output?: string;
  version?: string;
  notes?: string[];
  releaseId?: string;
  serviceId?: string;
  description?: string;
  status: 'pass' | 'fail';
  checks?: Record<
    string,
    {
      time?: string;
      output?: unknown;
      status: 'pass' | 'fail';
    }
  >;
}

const defaultOptions: HealthCheckOptions = {
  path: '/health',
  customChecks: [],
  readinessPath: '/ready',
  includeSystemInfo: true,
  includeMemoryUsage: true,
};

export default function createHealthCheckMiddleware(
  options: HealthCheckOptions = {}
): HttpMiddleware {
  const config = { ...defaultOptions, ...options };

  return async (
    req: HttpRequestContract,
    res: HttpResponseContract,
    next: (err?: unknown) => void
  ) => {
    const path = req.path;

    // Handle health check endpoint
    if (path === config.path) {
      const health = await generateHealthReport(config, false);
      const statusCode =
        health.status === 'pass'
          ? HttpStatusCode.OK
          : HttpStatusCode.SERVICE_UNAVAILABLE;

      return res.status(statusCode).json(health);
    }

    // Handle readiness check endpoint
    if (path === config.readinessPath) {
      const readiness = await generateHealthReport(config, true);
      const statusCode =
        readiness.status === 'pass'
          ? HttpStatusCode.OK
          : HttpStatusCode.SERVICE_UNAVAILABLE;

      return res.status(statusCode).json(readiness);
    }

    next();
  };
}

async function generateHealthReport(
  config: HealthCheckOptions,
  readinessOnly: boolean = false
): Promise<HealthStatus> {
  const startTime = Date.now();
  const health: HealthStatus = {
    checks: {},
    status: 'pass',
    version: process.env.APP_VERSION || '1.0.0',
    serviceId: process.env.APP_NAME || 'blitzbun-app',
    description: readinessOnly ? 'Readiness check' : 'Health check',
  };

  try {
    const appContainer = AppContext.get();

    // Basic system checks
    if (!readinessOnly && config.includeSystemInfo) {
      const profiler = appContainer.resolve('profiler');
      const systemInfo = profiler.snapshot();

      health.checks!['system:memory'] = {
        status: 'pass',
        time: new Date().toISOString(),
        output: systemInfo,
      };
    }

    // Basic application status
    health.checks!['app:status'] = {
      status: 'pass',
      time: new Date().toISOString(),
      output: 'Application is running',
    };

    // Run custom health checks
    for (const customCheck of config.customChecks || []) {
      try {
        const result = await customCheck.check();
        health.checks![`custom:${customCheck.name}`] = {
          status: result.status,
          time: new Date().toISOString(),
          output: result,
        };

        if (result.status === 'fail') {
          health.status = 'fail';
        }
      } catch (error) {
        health.status = 'fail';
        health.checks![`custom:${customCheck.name}`] = {
          status: 'fail',
          time: new Date().toISOString(),
          output:
            error instanceof Error ? error.message : 'Custom check failed',
        };
      }
    }

    const endTime = Date.now();
    health.output = `Health check completed in ${endTime - startTime}ms`;
  } catch (error) {
    health.status = 'fail';
    health.output =
      error instanceof Error ? error.message : 'Health check failed';
  }

  return health;
}
