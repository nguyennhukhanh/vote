import type { IRequestContext } from '@thanhhoajs/thanhhoa';

export class UserController {
  constructor() {}

  /**
   * @swagger
   * /api/user:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - user
   *     summary: Get me
   *     description: Get me
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: number
   *                   example: 1
   *                 email:
   *                   type: string
   *                   example: user@example.com
   *                 fullName:
   *                   type: string
   *                   example: Khanh Nguyen
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                   example: 2024-01-01T00:00:00.000Z
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   example: 2024-01-01T00:00:00.000Z
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               properties:
   *                 meta:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: number
   *                       example: 401
   *                     message:
   *                       type: string
   *                       example: Unauthorized
   *       404:
   *         description: Not found
   *         content:
   *           application/json:
   *             schema:
   *               properties:
   *                 meta:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: number
   *                       example: 404
   *                     message:
   *                       type: string
   *                       example: Not found
   */
  async getProfile(context: IRequestContext): Promise<Response> {
    const user = context.user;
    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
