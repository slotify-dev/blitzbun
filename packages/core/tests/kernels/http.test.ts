import HttpProvider from '@blitzbun/http';
import RouterProvider from '@blitzbun/router';
import HttpKernel from '@core/kernels/http';
import { describe, expect, it, vi } from 'bun:test';

describe('HttpKernel', () => {
  it('boots app with HttpProvider and RouterProvider, calls server.listen', async () => {
    const listenMock = vi.fn(() => Promise.resolve());
    const getMock = vi.fn(() => ({ listen: listenMock }));
    const registerProvidersMock = vi.fn();
    const bootMock = vi.fn(() => Promise.resolve());

    const appMock = {
      registerProviders: registerProvidersMock,
      boot: bootMock,
      get: getMock,
    };

    const kernel = new HttpKernel(appMock);
    await kernel.boot();

    expect(registerProvidersMock).toHaveBeenCalledWith([expect.any(HttpProvider), expect.any(RouterProvider)]);
    expect(bootMock).toHaveBeenCalled();
    expect(getMock).toHaveBeenCalledWith('server');
    expect(listenMock).toHaveBeenCalled();
  });
});
