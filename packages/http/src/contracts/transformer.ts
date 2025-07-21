import { ModelData, PaginatedData } from '@blitzbun/core';

/**
 * TransformerContract enforces shape for all transformer classes.
 * @template T - Input model type
 * @template R - Transformed output type
 */
export default interface TransformerContract<T extends ModelData, R extends ModelData> {
  /**
   * Transforms a single model instance into the desired shape.
   */
  transform(model: T): Promise<R>;

  /**
   * Transforms a collection (array or paginated) of model instances.
   */
  collection(input: PaginatedData<T> | T[]): Promise<ModelData | R[]>;

  /**
   * Defines how a model is mapped to output structure.
   */
  toArray(model: T): R | Promise<R>;
}
