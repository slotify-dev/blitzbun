export default interface EnvContract {
  has(key: string): boolean;
  get<T = string>(key: string, defaultValue?: T): T;
}
