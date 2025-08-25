import { EnvContract, SessionOptions } from '@blitzbun/contracts';

export default (envService: EnvContract): SessionOptions => {
  return {
    name: envService.get('SESSION_NAME', '__Secure-SessionId'),
    maxAge: parseInt(envService.get('SESSION_MAX_AGE', '604800'), 10), // 7 days default
    secure: envService.get('SESSION_SECURE', 'true') === 'true',
    httpOnly: envService.get('SESSION_HTTP_ONLY', 'true') === 'true',
    sameSite: envService.get('SESSION_SAME_SITE', 'Strict') as 'Strict' | 'Lax' | 'None',
    domain: envService.get('SESSION_DOMAIN', undefined),
    csrfProtection: envService.get('SESSION_CSRF_PROTECTION', 'true') === 'true',
    regenerateOnAuth: envService.get('SESSION_REGENERATE_ON_AUTH', 'true') === 'true',
    rolling: envService.get('SESSION_ROLLING', 'false') === 'true',
    secret: envService.get('SESSION_SECRET', ''),
  };
};