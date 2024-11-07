import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { describe, expect, test } from 'bun:test';

import { DefaultService } from './default.service';

describe('DefaultService', () => {
  const defaultService = new DefaultService();

  test('hello() should return a welcome message', async () => {
    const response = defaultService.hello();
    expect(response).toBeInstanceOf(Response);
    const text = await response.text();
    expect(text).toBe('Welcome to ThanhHoaJS! 🚀');
  });

  test('userAgent() should return the User-Agent header from context', async () => {
    const mockContext = {
      request: { headers: new Headers({ 'User-Agent': 'Test-Agent' }) },
    } as IRequestContext;

    const response = defaultService.userAgent(mockContext);
    expect(response).toBeInstanceOf(Response);
    const text = await response.text();
    expect(text).toBe('Test-Agent');
  });
});
