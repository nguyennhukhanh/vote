import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { describe, expect, test } from 'bun:test';

import { DefaultController } from './default.controller';
import { DefaultService } from './default.service';

class MockDefaultService extends DefaultService {
  hello(): Response {
    return new Response('Mocked Hello');
  }
  userAgent(context: IRequestContext): Response {
    return new Response('Mocked User-Agent');
  }
}

describe('DefaultController', () => {
  const mockService = new MockDefaultService();
  const defaultController = new DefaultController(mockService);

  test('hello() should return the correct response', async () => {
    const response = defaultController.hello();
    expect(response).toBeInstanceOf(Response);
    const text = await response.text();
    expect(text).toBe('Mocked Hello');
  });

  test('userAgent() should return the mocked User-Agent response', async () => {
    const mockContext = {
      request: { headers: new Headers({ 'User-Agent': 'Mock-Agent' }) },
    } as IRequestContext;

    const response = defaultController.userAgent(mockContext);
    expect(response).toBeInstanceOf(Response);
    const text = await response.text();
    expect(text).toBe('Mocked User-Agent');
  });
});
