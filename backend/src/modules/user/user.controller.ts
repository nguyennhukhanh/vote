import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { customResponse } from 'src/utils/custom-response';

import { UserQuery } from './dto/user.query';
import { UserUpdate } from './dto/user.update';
import type { UserService } from './user.service';

export class UserController {
  constructor(private readonly userService: UserService) {}

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
   *                 walletAddress:
   *                   type: string
   *                   example: 0x1234567890123456789012345678901234567890
   *                 avatarUrl:
   *                   type: string
   *                   example: https://example.com/avatar.jpg
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
    return customResponse(user);
  }

  /**
   * @swagger
   * /api/user:
   *   patch:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - user
   *     summary: Update profile
   *     description: Update user profile information including name, email, wallet address and avatar
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               fullName:
   *                 type: string
   *                 description: User's full name
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email address
   *               walletAddress:
   *                 type: string
   *                 description: User's wallet address
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: User's avatar image file
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: boolean
   *                   example: true
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       409:
   *         description: Email or wallet address already exists
   */
  async updateProfile(context: IRequestContext): Promise<Response> {
    try {
      const user = context.user;
      const input = await context.request.formData();

      const dto: Partial<UserUpdate> = {};

      const fullName = input.get('fullName');
      if (fullName) dto.fullName = fullName as string;

      const email = input.get('email');
      if (email) dto.email = email as string;

      const walletAddress = input.get('walletAddress');
      if (walletAddress) dto.walletAddress = walletAddress as string;

      const file = input.get('file');
      if (file instanceof File) dto.file = file;

      const result = await this.userService.updateProfile(
        user,
        new UserUpdate(dto),
      );
      return customResponse(result);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * /api/users:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - user
   *     summary: Get users with pagination
   *     description: Get list of users with pagination, search and filter options
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
   *                       walletAddress:
   *                         type: string
   *                       avatarUrl:
   *                         type: string
   *                       isActive:
   *                         type: boolean
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
  async getUsersWithPagination(context: IRequestContext): Promise<Response> {
    const query = context.query;
    const dto = new UserQuery(query);
    const result = await this.userService.getUsersWithPagination(dto);
    return customResponse(result);
  }
}
