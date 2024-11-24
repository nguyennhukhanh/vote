import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { customResponse } from 'src/utils/custom-response';

import { CandidateQuery } from '../candidate/dto/candidate.query';
import type { CandidateService } from './candidate.service';
import { CandidateCreate } from './dto/candidate.create';

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
   *         name: voteId
   *         schema:
   *           type: integer
   *         description: Filter by vote id
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

  /**
   * @swagger
   * /api/candidate/{id}:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - candidate
   *     summary: Get candidate
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Candidate id
   *     responses:
   *       200:
   *         description: Candidate detail
   */
  async getCandidateById(context: IRequestContext) {
    const id = Number(context.params.id);
    const result = await this.candidateService.getCandidateById(id);
    return customResponse(result);
  }

  /**
   * @swagger
   * /api/candidate/{voteId}:
   *   post:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - candidate
   *     summary: Create candidate
   *     parameters:
   *       - in: path
   *         name: voteId
   *         schema:
   *           type: integer
   *         required: true
   *         description: Vote id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 required: true
   *     responses:
   *       200:
   *         description: Candidate created
   */
  async createCandidate(context: IRequestContext) {
    const admin = context.admin;
    const voteId = Number(context.params.voteId);
    const { name } = await context.request.json();
    const dto = new CandidateCreate(name);

    const result = await this.candidateService.createCandidate(
      admin,
      voteId,
      dto,
    );
    return customResponse(result);
  }
}
