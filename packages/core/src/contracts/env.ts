export default interface EnvServiceContract {
  has(key: string): boolean;
  get<T = string>(key: string, defaultValue?: T): T;
}
