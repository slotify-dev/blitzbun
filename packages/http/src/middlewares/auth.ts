import {
  HttpMessage,
  HttpRequestContract,
  HttpResponseContract,
  HttpStatusCode,
} from '@blitzbun/contracts';
import { AppContext } from '@blitzbun/core';
import { isUuid } from 'packages/core/src/utils/common';

import jwt, { TokenExpiredError } from 'jsonwebtoken';
import RateLimiter from '../utils/rate-limiter';

export default async (
  req: HttpRequestContract,
  res: HttpResponseContract,
  next: (err?: unknown) => void
): Promise<unknown> => {
  const appContainer = AppContext.get();
  const configService = appContainer.resolve('config');

  if (!req.isValidContentType()) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      message: HttpMessage.BAD_REQUEST,
      code: HttpStatusCode.BAD_REQUEST,
    });
  }

  const token = req.bearerToken();
  const rateLimiter = await RateLimiter(req, 100);
  const jwtToken = configService.get('app.jwtToken', null);
  const jwtLogin = configService.get('app.jwtLogin', false);

  if (rateLimiter.failed) {
    return res.status(HttpStatusCode.THROTTLED).json({
      message: HttpMessage.THROTTLED,
      code: HttpStatusCode.THROTTLED,
    });
  }

  if (jwtLogin && jwtToken) {
    try {
      // Get session config to use the configured session cookie name
      const sessionConfig = configService.get('session', {}) as {
        name?: string;
      };
      const sessionCookieName = sessionConfig.name || 'JSESSIONID';

      const verified = jwt.verify(
        req.cookie(sessionCookieName, token),
        jwtToken
      );
      if (typeof verified === 'object' && verified !== null) {
        req.setUser(verified as Record<string, unknown>);
      }
    } catch (e) {
      const error = e as TokenExpiredError;
      console.log('AuthError: ', error.message);
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: HttpMessage.UNAUTHORIZED,
        code: HttpStatusCode.UNAUTHORIZED,
      });
    }
  }

  if (!isUuid(req.getUser('uuid'))) {
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      message: HttpMessage.UNAUTHORIZED,
      code: HttpStatusCode.UNAUTHORIZED,
    });
  }

  return next();
};
