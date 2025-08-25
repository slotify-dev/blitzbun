import {
  HttpRequestContract,
  HttpResponseContract,
  SecureSessionOptions,
} from '@blitzbun/contracts';

import { AppContext } from '@blitzbun/core';
import crypto from 'node:crypto';

const defaultSessionOptions: SecureSessionOptions = {
  maxAge: 60 * 60 * 24 * 7, // 7 days
  regenerateOnAuth: true,
  csrfProtection: true,
  name: 'sessionId',
  httpOnly: true,
  sameSite: 'Lax',
  rolling: false,
  path: '/',
};

function generateSecureSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateCSRFToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

export default async (
  req: HttpRequestContract,
  res: HttpResponseContract,
  next: (err?: unknown) => void
): Promise<void> => {
  try {
    const appContainer = AppContext.get();
    const configService = appContainer.resolve('config');

    // Get session configuration
    const sessionConfig = {
      ...defaultSessionOptions,
      ...configService.get('session', {}),
    };

    // Check if sessions are enabled via strategy
    if (
      !sessionConfig.strategy ||
      (sessionConfig.strategy !== 'redis' &&
        sessionConfig.strategy !== 'memory')
    ) {
      return next();
    }

    // Override secure setting based on environment
    sessionConfig.secure =
      configService.get<boolean>('app.isProd', false) ||
      req.getHeader('x-forwarded-proto') === 'https';

    // Get session store based on strategy
    const cacheManager = appContainer.resolve('cache');
    const sessionStore =
      sessionConfig.strategy === 'redis'
        ? cacheManager.store('redis_session')
        : cacheManager.store('memory');

    // Try get existing sessionId cookie
    let sessionId = req.cookie<string>(sessionConfig.name!);
    let isNewSession = false;

    // If no sessionId cookie, generate and set it
    if (!sessionId) {
      isNewSession = true;
      sessionId = generateSecureSessionId();

      res.cookie(sessionConfig.name!, sessionId, {
        path: sessionConfig.path,
        domain: sessionConfig.domain,
        maxAge: sessionConfig.maxAge,
        secure: sessionConfig.secure,
        httpOnly: sessionConfig.httpOnly,
        sameSite: sessionConfig.sameSite,
      });
    }

    // Load session data from store or create empty session
    let sessionData = (await sessionStore.get(sessionId)) as Record<
      string,
      unknown
    > | null;

    if (!sessionData) {
      isNewSession = true;
      sessionData = {
        isNew: true,
        id: sessionId,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      };
    } else {
      // Update last accessed time
      sessionData.lastAccessed = new Date().toISOString();
      sessionData.isNew = false;
    }

    // Handle rolling sessions
    if (sessionConfig.rolling && !isNewSession) {
      res.cookie(sessionConfig.name!, sessionId, {
        path: sessionConfig.path,
        domain: sessionConfig.domain,
        maxAge: sessionConfig.maxAge,
        secure: sessionConfig.secure,
        httpOnly: sessionConfig.httpOnly,
        sameSite: sessionConfig.sameSite,
      });
    }

    // Generate CSRF token if enabled
    if (sessionConfig.csrfProtection) {
      if (!sessionData.csrfToken) {
        sessionData.csrfToken = generateCSRFToken();
      }

      // Set CSRF token in response header for client-side access
      res.header('X-CSRF-Token', sessionData.csrfToken as string);

      // For state-changing requests, validate CSRF token
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const clientToken =
          req.getHeader('x-csrf-token') ||
          req.getHeader('csrf-token') ||
          req.input('_token');

        if (!clientToken || clientToken !== sessionData.csrfToken) {
          res.status(403).json({
            message: 'CSRF token mismatch',
            code: 403,
          });
          return;
        }
      }
    }

    // Session fixation protection - regenerate session ID on authentication
    if (sessionConfig.regenerateOnAuth && sessionData.regenerateOnAuth) {
      const newSessionId = generateSecureSessionId();

      // Delete old session
      await sessionStore.forget(sessionId);

      // Update session data
      sessionData.id = newSessionId;
      sessionData.regeneratedAt = new Date().toISOString();
      delete sessionData.regenerateOnAuth;

      // Set new cookie
      sessionId = newSessionId;
      res.cookie(sessionConfig.name!, newSessionId, {
        path: sessionConfig.path,
        domain: sessionConfig.domain,
        maxAge: sessionConfig.maxAge,
        secure: sessionConfig.secure,
        httpOnly: sessionConfig.httpOnly,
        sameSite: sessionConfig.sameSite,
      });
    }

    // Attach session to request for downstream use
    req.setSession(sessionData);

    // Add session helper methods to request
    (
      req as HttpRequestContract & { sessionRegenerate?: () => void }
    ).sessionRegenerate = () => {
      sessionData!.regenerateOnAuth = true;
    };

    // Register onEnd hook to persist session before response finishes
    res.onEnd(async () => {
      const currentSession = req.getSession() as Record<string, unknown>;
      if (currentSession) {
        currentSession.lastSaved = new Date().toISOString();
        await sessionStore.put(sessionId, currentSession, sessionConfig.maxAge);
      }
    });

    return next();
  } catch (error) {
    // Pass errors down middleware chain
    return next(error);
  }
};
