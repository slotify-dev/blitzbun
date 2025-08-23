import { PaginatedData } from '../types';

/**
 * TransformerContract describes how a table row (T)
 * should be converted into a transformed response (R),
 * with support for pagination and key access helpers.
 */
export default interface TransformerContract<T, R extends Partial<T>> {
  /**
   * Transforms a model into the desired output format.
   */
  transform(model: T): Promise<R>;

  /**
   * Returns the transformed array (can be async or sync).
   */
  toArray(model: T): R | Promise<R>;

  /**
   * Transforms a paginated set or array of models.
   */
  collection(input: T[]): Promise<R[]>;
  collection(input: PaginatedData<T>): Promise<PaginatedData<R>>;
}
