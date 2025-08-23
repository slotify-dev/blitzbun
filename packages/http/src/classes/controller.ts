/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpRequestContract, HttpResponseContract } from '@blitzbun/contracts';

export default abstract class BaseController {
  protected validator: string;
  protected abstract getRepository(): any;
  protected abstract getTransformer(req: HttpRequestContract): any;

  constructor(validator: string) {
    this.validator = validator;
  }

  protected validate = async (
    key: string,
    req: HttpRequestContract,
    res: HttpResponseContract
  ): Promise<boolean> => {
    if (!key) return true;
    const validator = req.getValidator(key);
    if (await validator.fails()) {
      res.status(400).json({ success: false, errors: validator.getErrors() });
      return false;
    }
    return true;
  };

  list = async (req: HttpRequestContract, res: HttpResponseContract) => {
    try {
      const results = await this.getRepository().paginate();
      return res.status(200).json({
        meta: results.meta,
        data: await this.getTransformer(req).collection(results.data),
      });
    } catch (e) {
      console.error(e);
      return res.status(400).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  fetch = async (req: HttpRequestContract, res: HttpResponseContract) => {
    try {
      if (!(await this.validate(`${this.validator}.fetch`, req, res))) return;
      const repo = this.getRepository();

      const pk = repo.getPk();
      const pkValue = req.param<string>(pk);
      const model = await repo.findBy(pk, pkValue);

      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'Invalid entity',
        });
      }

      return res.status(200).json({
        success: true,
        data: await this.getTransformer(req).transform(model),
      });
    } catch (e) {
      console.error(e);
      return res.status(400).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  create = async (req: HttpRequestContract, res: HttpResponseContract) => {
    try {
      if (!(await this.validate(`${this.validator}.create`, req, res))) return;
      return res.status(200).json({
        success: true,
        data: await this.getTransformer(req).transform(
          await this.getRepository().create()
        ),
      });
    } catch (e) {
      console.error(e);
      return res.status(400).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  update = async (req: HttpRequestContract, res: HttpResponseContract) => {
    try {
      if (!(await this.validate(`${this.validator}.update`, req, res))) return;

      await this.getRepository().update();
      return res.status(204).json({
        success: true,
      });
    } catch (e) {
      console.error(e);
      return res.status(400).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  };

  delete = async (req: HttpRequestContract, res: HttpResponseContract) => {
    try {
      if (!(await this.validate(`${this.validator}.fetch`, req, res))) return;

      const repo = this.getRepository();
      const pk = repo.getPk();
      const pkValue = req.param<string>(pk);
      await repo.deleteBy(pk, pkValue);

      return res.status(200).json({ success: true });
    } catch (e) {
      console.error(e);
      return res.status(400).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  };
}
