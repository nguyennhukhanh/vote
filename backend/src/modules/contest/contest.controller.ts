import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { customResponse } from 'src/utils/custom-response';

import type { ContestService } from './contest.service';
import { ContestCreate } from './dto/contest.create';
import { ContestQuery } from './dto/contest.query';

export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  /**
   * @swagger
   * /api/contest:
   *   get:
   *     tags:
   *       - contest
   *     summary: Get contests with pagination
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search by contest name, admin fullName or email
   *       - in: query
   *         name: fromDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter by start date from
   *       - in: query
   *         name: toDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter by start date to
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [ASC, DESC]
   *         description: Sort by start time
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Items per page
   *     responses:
   *       200:
   *         description: List of contests
   */
  async getContestsWithPagination(context: IRequestContext) {
    const query = new ContestQuery(context.query);
    const result = await this.contestService.getContestsWithPagination(query);
    return customResponse(result);
  }

  /**
   * @swagger
   * /api/contest:
   *   post:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - contest
   *     summary: Create a new contest
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               startTime:
   *                 type: string
   *                 format: date-time
   *               endTime:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       200:
   *         description: Contest created successfully
   */
  async createContest(context: IRequestContext) {
    const admin = context.admin;
    const { name, startTime, endTime } = await context.request.json();
    const dto = new ContestCreate({ name, startTime, endTime });

    const result = await this.contestService.createContest(admin, dto);
    return customResponse(result);
  }
}
