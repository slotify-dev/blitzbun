import Application from '@core/application';
import { describe, expect, it, vi } from 'bun:test';

describe('Application', () => {
  it('binds and resolves services through container', () => {
    type Registry = { foo: string };
    const app = new Application<Registry>();
    app.use('foo', 'bar');
    expect(app.get('foo')).toBe('bar');
  });

  it('has() returns correct boolean', () => {
    type Registry = { foo: string };
    const app = new Application<Registry>();
    app.use('foo', 'bar');
    expect(app.has('foo')).toBe(true);
    expect(app.has('bar')).toBe(false);
  });

  it('registerProvider calls provider.register()', () => {
    const registerMock = vi.fn();
    const provider = { register: registerMock };
    const app = new Application();

    app.registerProvider(provider);
    expect(registerMock).toHaveBeenCalledWith(app);
  });

  it('registerProviders calls register on each provider', () => {
    const registerMock1 = vi.fn();
    const registerMock2 = vi.fn();
    const providers = [{ register: registerMock1 }, { register: registerMock2 }];
    const app = new Application();

    app.registerProviders(providers);
    expect(registerMock1).toHaveBeenCalledWith(app);
    expect(registerMock2).toHaveBeenCalledWith(app);
  });

  it('boot() calls boot on providers if exists', async () => {
    const bootMock = vi.fn();
    const provider = { register() {}, boot: bootMock };
    const app = new Application();

    app.registerProvider(provider);
    await app.boot();
    expect(bootMock).toHaveBeenCalledWith(app);
  });

  it('shutdown() calls shutdown on providers if exists', async () => {
    const shutdownMock = vi.fn();
    const provider = { register() {}, shutdown: shutdownMock };
    const app = new Application();

    app.registerProvider(provider);
    await app.shutdown();
    expect(shutdownMock).toHaveBeenCalledWith(app);
  });
});
