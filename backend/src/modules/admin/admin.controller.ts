import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { customResponse } from 'src/utils/custom-response';

import type { AdminService } from './admin.service';
import { AdminQuery } from './dto/admin.query';

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * @swagger
   * /api/admin:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - admin
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
   *                   example: admin@example.com
   *                 fullName:
   *                   type: string
   *                   example: Khanh Nguyen
   *                 role:
   *                   type: string
   *                   example: SUPER_ADMIN
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
    const admin = context.admin;
    return customResponse(admin);
  }

  /**
   * @swagger
   * /api/admins:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - admin
   *     summary: Get admins with pagination
   *     description: Get list of admins with pagination, search and filter options
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search by name or email
   *       - in: query
   *         name: fromDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by created date from
   *       - in: query
   *         name: toDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by created date to
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [ASC, DESC]
   *         description: Sort by created date
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 10
   *         description: Items per page
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 items:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: number
   *                       email:
   *                         type: string
   *                       fullName:
   *                         type: string
   *                       role:
   *                         type: string
   *                       isActive:
   *                         type: boolean
   *                       createdBy:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: number
   *                           email:
   *                             type: string
   *                           fullName:
   *                             type: string
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *                 meta:
   *                   type: object
   *                   properties:
   *                     itemCount:
   *                       type: number
   *                       example: 10
   *                     totalItems:
   *                       type: number
   *                       example: 100
   *                     itemsPerPage:
   *                       type: number
   *                       example: 10
   *                     totalPages:
   *                       type: number
   *                       example: 10
   *                     currentPage:
   *                       type: number
   *                       example: 1
   *       401:
   *         description: Unauthorized
   */
  async getAdminsWithPagination(context: IRequestContext): Promise<Response> {
    const query = context.query;
    const dto = new AdminQuery(query);
    const result = await this.adminService.getAdminsWithPagination(dto);
    return customResponse(result);
  }
}
