import { ValidationError } from '../types';

export default interface ValidatorContract {
  fails(): Promise<boolean>;
  getErrors(): ValidationError[];
}
