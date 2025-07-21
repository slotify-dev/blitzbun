/* eslint-disable security/detect-object-injection */
import { ModelData, PaginatedData } from '@blitzbun/core';
import { get, isEmpty, isFunction, omit, startCase, union } from 'lodash';
import { HttpRequestContract, TransformerContract } from '../contracts';

export default abstract class BaseTransformer<T extends ModelData, R extends ModelData> implements TransformerContract<T, R> {
  private includes: string[];
  protected request: HttpRequestContract;

  constructor(request: HttpRequestContract, includes: string[] = []) {
    this.request = request;
    this.includes = union(includes, this.request.query<string>('include', '').split(','));
  }

  private isValid(model: Partial<T>): model is T {
    return Boolean(model?.uuid || model?.id);
  }
  private async transformModel(rows: T[]): Promise<R[]> {
    const transformed: R[] = [];
    for (const row of rows) {
      if (this.isValid(row)) {
        transformed.push(await this.transform(row));
      }
    }
    return transformed;
  }

  protected get<V = unknown>(model: T, key: string, defaultVal?: V): V {
    return get(model, key, defaultVal) as V;
  }

  async collection(input: PaginatedData<T> | T[]): Promise<ModelData | R[]> {
    if (Array.isArray(input)) {
      return await this.transformModel(input);
    }
    return {
      ...input.meta,
      data: await this.transformModel(input.data),
    };
  }

  async transform(model: T): Promise<R> {
    if (isEmpty(model)) return {} as R;

    const base = this.toArray.constructor.name === 'AsyncFunction' ? await this.toArray(model) : this.toArray(model);
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
