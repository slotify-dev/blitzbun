import Container from '@core/container';
import { describe, expect, it } from 'bun:test';

describe('Container', () => {
  it('bind stores the value under the given key', () => {
    const container = new Container<{ foo: string }>();
    container.bind('foo', 'bar');

    expect(container.has('foo')).toBe(true);
    expect(container.resolve('foo')).toBe('bar');
  });

  it('resolve throws if key is not bound', () => {
    const container = new Container<{ foo: string }>();
    expect(() => container.resolve('foo')).toThrow('No binding found for key "foo"');
  });

  it('has returns false for missing keys', () => {
    const container = new Container<{ foo: string }>();
    expect(container.has('foo')).toBe(false);
  });

  it('binds and resolves values correctly', () => {
    const container = new Container<{ foo: string }>();
    container.bind('foo', 'bar');
    expect(container.resolve('foo')).toBe('bar');
  });

  it('throws error when resolving unknown key', () => {
    const container = new Container<{ foo: string }>();
    expect(() => container.resolve('foo')).toThrow(/No binding/);
  });

  it('returns true/false from has()', () => {
    const container = new Container<{ foo: string }>();
    container.bind('foo', 'bar');
    expect(container.has('foo')).toBe(true);
    expect(container.has('bar')).toBe(false);
  });
});
