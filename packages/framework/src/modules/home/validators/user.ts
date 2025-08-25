import { z, ZodObject } from 'zod';

export default (): ZodObject<Record<string, z.ZodTypeAny>> => {
  return z.object({});
};
