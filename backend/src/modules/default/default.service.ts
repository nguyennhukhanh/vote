import type { IRequestContext } from '@thanhhoajs/thanhhoa';

export class DefaultService {
  hello(): Response {
    return new Response('Welcome to ThanhHoaJS! 🚀', {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  userAgent(context: IRequestContext): Response {
    return new Response(context.request.headers.get('User-Agent'), {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
