import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { customResponse } from 'src/utils/custom-response';

import type { ContestService } from './contest.service';
import { ContestCandidateChartQuery } from './dto/contest.candidate.chart.query';
import { ContestChartQuery } from './dto/contest.chart.query';
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

  /**
   * @swagger
   * /api/contest/statistics:
   *   get:
   *     tags:
   *       - contest
   *     summary: Get contest statistics for chart
   *     parameters:
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
   *     responses:
   *       200:
   *         description: Contest statistics for chart
   */
  async getContestStatistics(context: IRequestContext) {
    const query = new ContestChartQuery(context.query);
    const result = await this.contestService.getContestStatistics(query);
    return customResponse(result);
  }

  /**
   * @swagger
   * /api/contest/{contestId}/pie-chart:
   *   get:
   *     tags:
   *       - contest
   *     summary: Get vote distribution pie chart for a contest
   *     parameters:
   *       - in: path
   *         name: contestId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Pie chart data for candidate vote distribution
   */
  async getCandidatePieChart(context: IRequestContext) {
    const contestId = Number(context.params.contestId);
    const result = await this.contestService.getCandidatePieChart(contestId);
    return customResponse(result);
  }

  /**
   * @swagger
   * /api/contest/{contestId}/stacked-chart:
   *   get:
   *     tags:
   *       - contest
   *     summary: Get stacked bar chart for votes over time
   *     parameters:
   *       - in: path
   *         name: contestId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: fromDate
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: toDate
   *         schema:
   *           type: string
   *           format: date-time
   *     responses:
   *       200:
   *         description: Stacked chart data for votes over time
   */
  async getCandidateStackedChart(context: IRequestContext) {
    const contestId = Number(context.params.contestId);
    const query = new ContestCandidateChartQuery({
      ...context.query,
      contestId,
    });

    const result = await this.contestService.getCandidateStackedChart(query);
    return customResponse(result);
  }
}
