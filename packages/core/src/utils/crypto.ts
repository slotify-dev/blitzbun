/* eslint-disable security/detect-object-injection */
import crypto from 'node:crypto';

export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(7);
};

export const createPassword = (password: string): string => {
  return Bun.password.hashSync(password);
};

export const verifyPassword = (
  password: string,
  userDBPass: string
): boolean => {
  return Bun.password.verifySync(password, userDBPass);
};

export const getAppToken = (prefix: string = '', size: number = 32): string => {
  return prefix + crypto.randomBytes(size).toString('base64');
};

export const getRandomHash = (
  size: number = 32,
  format: BufferEncoding = 'base64'
): string => {
  return crypto.randomBytes(size).toString(format);
};

export const base64 = (str: ArrayBuffer | SharedArrayBuffer): string => {
  return Buffer.from(str as ArrayBuffer).toString('base64');
};

export const base64Json = <T = unknown>(data: T): string => {
  return Buffer.from(JSON.stringify(data)).toString('base64');
};

export const oHash = (obj: Record<string, unknown>): string => {
  if (!obj) return '';
  const keys = Object.keys(obj).sort();
  return keys.map((k) => `${k}:${String(obj[k])}`).join('|');
};
