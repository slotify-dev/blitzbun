/* eslint-disable security/detect-object-injection */
import {
  HttpRequestContract,
  PaginatedData,
  TransformerContract,
} from '@blitzbun/contracts';
import { get, isEmpty, isFunction, omit, startCase, union } from 'lodash';

export default abstract class BaseTransformer<T, R extends Partial<T>>
  implements TransformerContract<T, R>
{
  private includes: string[];
  protected request: HttpRequestContract;

  constructor(request: HttpRequestContract, includes: string[] = []) {
    this.request = request;
    this.includes = union(
      includes,
      this.request.query<string>('include', '').split(',')
    );
  }

  protected isValid(model: Partial<T>): model is T {
    return Boolean(model && ('uuid' in model || 'id' in model));
  }

  protected async transformModel(rows: T[]): Promise<R[]> {
    const transformed: R[] = [];
    for (const row of rows) {
      if (this.isValid(row)) {
        transformed.push(await this.transform(row));
      }
    }
    return transformed;
  }

  async collection(input: T[]): Promise<R[]>;
  async collection(input: PaginatedData<T>): Promise<PaginatedData<R>>;
  async collection(
    input: PaginatedData<T> | T[]
  ): Promise<R[] | PaginatedData<R>> {
    if (Array.isArray(input)) {
      return await this.transformModel(input);
    }

    return {
      ...input,
      data: await this.transformModel(input.data),
    };
  }

  async transform(model: T): Promise<R> {
    if (isEmpty(model)) return {} as R;

    const base = await Promise.resolve(this.toArray(model));
    const result: Record<string, unknown> = omit(base, ['id']);

    for (const key of this.includes) {
      const methodName = 'include' + startCase(key).replace(/\s+/g, '');
      const method = get(this, methodName);

      if (isFunction(method)) {
        result[key] = await method.call(this, model, this.request);
      }
    }

    return result as R;
  }

  abstract toArray(model: T): R | Promise<R>;
}
