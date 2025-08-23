/* eslint-disable security/detect-object-injection */
import { HttpRequestContract, HttpRouteContract } from '@blitzbun/contracts';
import { HttpRequest } from '../classes';

export interface RequestLimits {
  maxBodySize?: number;
  maxFileSize?: number;
  maxFiles?: number;
}

const DEFAULT_LIMITS: RequestLimits = {
  maxBodySize: 1024 * 1024 * 10, // 10MB
  maxFileSize: 1024 * 1024 * 5, // 5MB per file
  maxFiles: 10,
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default async function createHttpRequest(
  nativeRequest: Request,
  route: HttpRouteContract,
  limits: RequestLimits = {}
): Promise<HttpRequestContract> {
  const config = { ...DEFAULT_LIMITS, ...limits };
  const routeData = route?.getModule();

  const type = nativeRequest.headers.get('content-type')?.toLowerCase() ?? '';
  const contentLength = parseInt(
    nativeRequest.headers.get('content-length') || '0',
    10
  );

  // Check content length limit
  if (contentLength > config.maxBodySize!) {
    throw new Error(
      `Request body too large. Maximum size: ${formatBytes(config.maxBodySize!)}, received: ${formatBytes(contentLength)}`
    );
  }

  let parsedBody: unknown;

  try {
    if (type.includes('application/json')) {
      parsedBody = await nativeRequest.json();
    } else if (type.includes('application/x-www-form-urlencoded')) {
      const formData = await nativeRequest.formData();
      parsedBody = Object.fromEntries(formData.entries());
    } else if (type.includes('text/plain')) {
      parsedBody = await nativeRequest.text();
    } else if (type.includes('multipart/form-data')) {
      const formData = await nativeRequest.formData();
      const files: File[] = [];
      const data: Record<string, string | File> = {};

      for (const [key, value] of formData.entries()) {
        if (
          typeof value === 'object' &&
          value !== null &&
          'size' in value &&
          'name' in value
        ) {
          const file = value as File;
          files.push(file);

          // Check individual file size
          if (file.size > config.maxFileSize!) {
            throw new Error(
              `File too large: ${file.name}. Maximum size: ${formatBytes(config.maxFileSize!)}, received: ${formatBytes(file.size)}`
            );
          }
        }
        data[key] = value;
      }

      // Check file count limit
      if (files.length > config.maxFiles!) {
        throw new Error(
          `Too many files. Maximum: ${config.maxFiles}, received: ${files.length}`
        );
      }

      parsedBody = data;
    } else if (type.includes('application/octet-stream')) {
      parsedBody = Buffer.from(await nativeRequest.arrayBuffer());
    } else {
      parsedBody = {};
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('too large')) {
      throw error; // Re-throw size limit errors
    }
    parsedBody = {};
  }

  const routeParams: Record<string, string> = {};
  const { pathname } = new URL(nativeRequest.url);

  if (
    routeData.keys !== undefined &&
    routeData.pattern !== undefined &&
    routeData.keys.length > 0
  ) {
    const matches = routeData.pattern.exec(pathname);
    if (matches) {
      for (let j = 0; j < routeData.keys.length; j++) {
        routeParams[routeData.keys[j] as string] = matches[j + 1];
      }
    }
  }

  return new HttpRequest(parsedBody, nativeRequest, routeData).setParams(
    routeParams
  );
}
