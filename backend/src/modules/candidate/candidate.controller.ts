import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { customResponse } from 'src/utils/custom-response';

import { CandidateQuery } from '../candidate/dto/candidate.query';
import type { CandidateService } from './candidate.service';

export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  /**
   * @swagger
   * /api/candidate:
   *   get:
   *     tags:
   *       - candidate
   *     summary: Get candidates with pagination
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search by candidate name
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
   *         description: List of candidates
   */
  async getCandidatesWithPagination(context: IRequestContext) {
    const query = new CandidateQuery(context.query);
    const result = await this.candidateService.getCandidatesWithPagination(
      query,
    );
    return customResponse(result);
  }
}
