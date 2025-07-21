import { FileHelper } from '@blitzbun/core';
import path from 'path';
import { z, ZodError, ZodIssue, ZodObject } from 'zod';
import { HttpRequestContract } from '../contracts';
import ValidatorContract from '../contracts/validator';
import { RouteData, ValidationError } from '../types';

export default class Validator implements ValidatorContract {
  private errors: ValidationError[] = [];
  private schema: ZodObject<Record<string, z.ZodTypeAny>> | null = null;

  constructor(
    private readonly path: string,
    private readonly routeData: RouteData,
    private readonly req: HttpRequestContract
  ) {}

  /**
   * Parse validator path like:
   * - "payment.file" => use current module, path "payment/file.ts"
   * - "app::payment.file" => module "app", path "payment/file.ts"
   */
  private parseValidatorPath(): { moduleName: string; filePathParts: string[] } {
    if (this.path.includes('::')) {
      const [moduleName, filePath] = this.path.split('::');
      return { moduleName, filePathParts: filePath.split('.') };
    }

    return {
      moduleName: '',
      filePathParts: this.path.split('.'),
    };
  }

  /**
   * Resolve absolute path to validator file
   */
  private getValidatorFilePath(): string {
    const { moduleName, filePathParts } = this.parseValidatorPath();
    const fileName = filePathParts.pop()!; // guaranteed by split('.')
    const dirPath = path.join(this.routeData.modulePath as string, moduleName, 'validators', ...filePathParts);
    return path.join(dirPath, `${fileName}.ts`);
  }

  /**
   * Dynamically load and cache schema
   */
  private async loadSchema(): Promise<ZodObject<Record<string, z.ZodTypeAny>>> {
    if (this.schema) return this.schema;

    const filePath = this.getValidatorFilePath();
    const module: (req?: HttpRequestContract) => ZodObject<Record<string, z.ZodTypeAny>> = await FileHelper.getFileAsync(filePath);

    if (typeof module !== 'function') {
      throw new Error(`Validator file must export a default function at: ${filePath}`);
    }

    const schema = module(this.req);
    if (!(schema instanceof ZodObject)) {
      throw new Error('Validator must return a ZodObject schema');
    }

    this.schema = schema;
    return schema;
  }

  async fails(): Promise<boolean> {
    const schema = await this.loadSchema();
    const data = await this.req.json<Record<string, unknown>>().catch(() => ({}));
    const result = schema.safeParse(data);

    if (!result.success && result.error instanceof ZodError) {
      this.errors = result.error.issues.map(
        (err: ZodIssue): ValidationError => ({
          field: err.path.join('.'),
          message: err.message,
        })
      );
      return true;
    }

    return false;
  }

  getErrors(): ValidationError[] {
    return this.errors;
  }
}
