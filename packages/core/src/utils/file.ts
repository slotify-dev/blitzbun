/* eslint-disable security/detect-non-literal-fs-filename */
import { write } from 'bun';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'path';

export function fileExists(filePath: string): boolean {
  try {
    const resolvedPath = path.resolve(filePath); // sanitize path
    return existsSync(resolvedPath) && statSync(resolvedPath).isFile();
  } catch {
    return false;
  }
}
export function directoryExists(dirPath: string): boolean {
  try {
    const resolvedPath = path.resolve(dirPath); // sanitize path
    return existsSync(resolvedPath) && statSync(resolvedPath).isDirectory();
  } catch {
    return false;
  }
}

export async function createFile(filePath: string, content: string): Promise<void> {
  if (!fileExists(filePath)) {
    await write(filePath, content);
  }
}

export async function createDir(dirPath: string): Promise<void> {
  if (!directoryExists(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

export function getDirFiles(dirPath: string): string[] {
  if (!directoryExists(dirPath)) return [];
  return readdirSync(dirPath);
}

export async function getDirFilesAsync(dirPath: string): Promise<string[]> {
  if (!directoryExists(dirPath)) return [];
  return await readdir(dirPath);
}

export async function getFileAsync<T = unknown>(filePath: string, defaultVal: T = null as T): Promise<T> {
  try {
    const module = await import(filePath);
    return (module.default ?? module) as T;
  } catch (error) {
    console.error(`getFileAsyncError: ${filePath}`, error);
    return defaultVal;
  }
}

export async function loadFiles(basePath: string, callback: (fileData: unknown, fileName: string) => void | Promise<void>): Promise<void> {
  try {
    if (directoryExists(basePath)) {
      const files = await readdir(basePath);
      for (const file of files) {
        await callback(await getFileAsync(path.join(basePath, file), {}), file.replace(/\.(ts|js)$/, ''));
      }
    }
  } catch (error) {
    console.error(`Error loading files from ${basePath}:`, error);
  }
}
