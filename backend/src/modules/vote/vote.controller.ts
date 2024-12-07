import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { customResponse } from 'src/utils/custom-response';

import { VoteQuery } from './dto/vote.query';
import type { VoteService } from './vote.service';

export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  /**
   * @swagger
   * /api/vote:
   *   get:
   *     tags:
   *       - vote
   *     summary: Get votes with pagination
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search by vote name
   *       - in: query
   *         name: voteId
   *         schema:
   *           type: integer
   *       - in: query
   *         name: candidateId
   *         schema:
   *           type: integer
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
   *         description: List of votes
   */
  async getVotesWithPagination(context: IRequestContext) {
    const query = new VoteQuery(context.query);
    const result = await this.voteService.getVotesWithPagination(query);
    return customResponse(result);
  }
}
