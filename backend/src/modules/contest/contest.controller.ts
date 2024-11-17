import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { customResponse } from 'src/utils/custom-response';

import type { ContestService } from './contest.service';
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
  async getContestsWithPagination(ctx: IRequestContext) {
    const query = new ContestQuery(ctx.query);
    const result = await this.contestService.getContestsWithPagination(query);
    return customResponse(result);
  }
}
