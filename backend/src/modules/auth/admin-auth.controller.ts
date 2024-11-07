import type { IRequestContext } from '@thanhhoajs/thanhhoa';

import type { AdminAuthService } from './admin-auth.service';
import { CreateAdminDto } from './dto/admin.create';
import { ValidateAdminDto } from './dto/admin.validate';

export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  /**
   * @swagger
   * paths:
   *   /api/admin/auth/register:
   *     post:
   *       tags:
   *         - auth/admin
   *       security:
   *         - bearerAuth: []
   *       summary: Register
   *       description: Grant an account to a new admin
   *       requestBody:
   *         required: true
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 email:
   *                   type: string
   *                   format: email
   *                   default: admin@example.com
   *                 password:
   *                   type: string
   *                   default: 123456
   *                 fullName:
   *                   type: string
   *                   default: Khanh Nguyen
   *               required:
   *                 - email
   *                 - password
   *                 - fullName
   *       responses:
   *         200:
   *           description: Success
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   admin:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: number
   *                       email:
   *                         type: string
   *                       fullName:
   *                         type: string
   *                   tokens:
   *                        type: object
   *                        properties:
   *                          accessToken:
   *                            type: string
   *                          refreshToken:
   *                            type: string
   *                          expiresAt:
   *                            type: number
   *         409:
   *           description: Unauthorized
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   meta:
   *                     type: object
   *                     properties:
   *                       status:
   *                         type: number
   *                         example: 409
   *                       message:
   *                         type: string
   *                         example: Email already exist
   */
  async register(context: IRequestContext): Promise<Response> {
    try {
      const { email, password, fullName } = await context.request.json();
      const dto = new CreateAdminDto({ email, fullName, password });

      const admin = await this.adminAuthService.register(context, dto);

      return new Response(JSON.stringify(admin), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * paths:
   *   /api/admin/auth/login:
   *     post:
   *       tags:
   *         - auth/admin
   *       summary: Login
   *       description: Login
   *       requestBody:
   *         required: true
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 email:
   *                   type: string
   *                   format: email
   *                   default: admin@example.com
   *                 password:
   *                   type: string
   *                   default: 123456
   *               required:
   *                 - email
   *                 - password
   *                 - fullName
   *       responses:
   *         200:
   *           description: Success
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   admin:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: number
   *                       email:
   *                         type: string
   *                       fullName:
   *                         type: string
   *                       createdAt:
   *                         type: string
   *                       updatedAt:
   *                         type: string
   *                   tokens:
   *                        type: object
   *                        properties:
   *                          accessToken:
   *                            type: string
   *                          refreshToken:
   *                            type: string
   *                          expiresAt:
   *                            type: number
   *         404:
   *           description: Not found
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   meta:
   *                     type: object
   *                     properties:
   *                       status:
   *                         type: number
   *                         example: 404
   *                       message:
   *                         type: string
   *                         example: Not found
   */
  async login(context: IRequestContext): Promise<Response> {
    try {
      const { email, password } = await context.request.json();
      new ValidateAdminDto({ email, password });

      const admin = await this.adminAuthService.login(email, password);

      return new Response(JSON.stringify(admin), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * paths:
   *   /api/admin/auth/logout:
   *     get:
   *       security:
   *         - bearerAuth: []
   *       tags:
   *         - auth/admin
   *       summary: Logout
   *       description: Logout
   *       responses:
   *         200:
   *           description: Success
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   isLogout:
   *                     type: boolean
   *                     example: true
   *         401:
   *           description: Unauthorized
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   meta:
   *                     type: object
   *                     properties:
   *                       status:
   *                         type: number
   *                         example: 401
   *                       message:
   *                         type: string
   *                         example: Unauthorized
   */
  async logout(context: IRequestContext): Promise<Response> {
    try {
      const isLogout = await this.adminAuthService.logout(context);
      return new Response(JSON.stringify({ isLogout }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * paths:
   *   /api/admin/auth/refresh-token:
   *     get:
   *       security:
   *         - bearerAuth: []
   *       tags:
   *         - auth/admin
   *       summary: Refresh token
   *       description: Refresh token
   *       responses:
   *         200:
   *           description: Success
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   admin:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: number
   *                       email:
   *                         type: string
   *                       fullName:
   *                         type: string
   *                       createdAt:
   *                         type: string
   *                       updatedAt:
   *                         type: string
   *                   tokens:
   *                       type: object
   *                       properties:
   *                         accessToken:
   *                           type: string
   *                         refreshToken:
   *                           type: string
   *                         expiresAt:
   *                           type: number
   *         404:
   *           description: Not found
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   meta:
   *                     type: object
   *                     properties:
   *                       status:
   *                         type: number
   *                       message:
   *                         type: string
   *                         example: Not found
   */
  async refreshToken(context: IRequestContext): Promise<Response> {
    try {
      const admin = await this.adminAuthService.refreshToken(context);
      return new Response(JSON.stringify(admin), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      throw error;
    }
  }
}
