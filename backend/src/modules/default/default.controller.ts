import type { IRequestContext } from '@thanhhoajs/thanhhoa';

import type { DefaultService } from './default.service';

export class DefaultController {
  constructor(private readonly defaultService: DefaultService) {}

  /**
   * @swagger
   * paths:
   *   /api:
   *     get:
   *       tags:
   *         - default
   *       summary: Returns a welcome message
   *       responses:
   *         200:
   *           description: Returns a welcome message
   *           content:
   *             text/plain:
   *               schema:
   *                 type: string
   *                 example: Welcome to ThanhHoaJS! 🚀
   */
  hello(): Response {
    return this.defaultService.hello();
  }

  /**
   * @swagger
   * paths:
   *   /api/user-agent:
   *     get:
   *       tags:
   *         - default
   *       summary: Returns the User-Agent header from the request
   *       responses:
   *         200:
   *           description: Returns the User-Agent header from the request
   *           content:
   *             text/plain:
   *               schema:
   *                 type: string
   *                 example: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.101.76 Safari/537.36
   */
  userAgent(context: IRequestContext): Response {
    return this.defaultService.userAgent(context);
  }
}
