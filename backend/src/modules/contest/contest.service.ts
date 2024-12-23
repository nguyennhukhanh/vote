import type { SQL } from 'drizzle-orm';
import { and, asc, desc, eq, gte, like, lte, or, sql } from 'drizzle-orm';
import type { MySqlSelect } from 'drizzle-orm/mysql-core';
import type { Contract } from 'ethers';
import { ethers, JsonRpcProvider, type Provider } from 'ethers';
import fs from 'fs';
import moment from 'moment';
import { appConfig } from 'src/configs/app.config';
import { db } from 'src/database/db';
import { type Admin, admins } from 'src/database/schemas/admins.schema';
import { candidates } from 'src/database/schemas/candidates.schema';
import { contests } from 'src/database/schemas/contests.schema';
import { votes } from 'src/database/schemas/votes.schema';
import { SortEnum } from 'src/shared/enums';
import { dateToUnixTimestamp } from 'src/utils/moment';
import { paginate, type PaginatedResult } from 'src/utils/paginate';
import { getRandomColor } from 'src/utils/random-color';

import type { ContestCandidateChartQuery } from './dto/contest.candidate.chart.query';
import type { ContestChartQuery } from './dto/contest.chart.query';
import type { ContestCreate } from './dto/contest.create';
import type { ContestQuery } from './dto/contest.query';

export class ContestService {
  private _provider: Provider;
  private _contract: Contract;

  constructor() {
    this._provider = new JsonRpcProvider(appConfig.rpcEndpoint);
    const contractAbi = fs.readFileSync(
      './abis/multi-contest-voting.abi.json',
      'utf8',
    );

    if (!appConfig.ownerPrivateKey) {
      throw new Error('Owner private key is not defined');
    }

    const ownerWallet = new ethers.Wallet(
      appConfig.ownerPrivateKey,
      this._provider,
    );

    this._contract = new ethers.Contract(
      appConfig.contractAddress,
      contractAbi,
      ownerWallet,
    );
  }

  async getContestsWithPagination<T>(
    query: ContestQuery,
  ): Promise<PaginatedResult<T>> {
    const { search, fromDate, toDate, sort, page = 1, limit = 10 } = query;
    const filters: SQL[] = [];

    const queryBuilder = db
      .select({
        id: contests.id,
        voteId: contests.voteId,
        name: contests.name,
        createdBy: {
          id: sql`${admins.id} as responderId`,
          fullName: admins.fullName,
          email: admins.email,
        },
        startTime: contests.startTime,
        endTime: contests.endTime,
        blockTimestamp: contests.blockTimestamp,
        blockNumber: contests.blockNumber,
        transactionHash: contests.transactionHash,
        createdAt: contests.createdAt,
      })
      .from(contests)
      .innerJoin(admins, eq(contests.createdBy, admins.id));

    if (search) {
      filters.push(
        or(
          like(contests.name, `%${search}%`),
          like(admins.fullName, `%${search}%`),
          like(admins.email, `%${search}%`),
        ) as SQL,
      );
    }
    if (fromDate) filters.push(gte(contests.startTime, fromDate));
    if (toDate) filters.push(lte(contests.startTime, toDate));

    if (filters.length > 0) {
      queryBuilder.where(and(...filters));
    }

    if (sort) {
      (queryBuilder as unknown as MySqlSelect).orderBy(
        sort === SortEnum.ASC
          ? asc(contests.startTime)
          : desc(contests.startTime),
      );
    }

    return await paginate(db, queryBuilder, page, limit);
  }

  async createContest(admin: Admin, dto: ContestCreate) {
    const { name, startTime, endTime } = dto;

    return await db.transaction(async (tx) => {
      try {
        const voteIdTx = await this._contract.createVote(
          dateToUnixTimestamp(startTime),
          dateToUnixTimestamp(endTime),
        );

        const receipt = await voteIdTx.wait();

        const newContest = await tx
          .insert(contests)
          .values({
            name,
            createdBy: admin.id,
            startTime: moment.utc(startTime).toDate(),
            endTime: moment.utc(endTime).toDate(),
            blockNumber: receipt?.blockNumber,
            transactionHash: receipt?.hash,
          })
          .$returningId();

        return {
          id: newContest[0].id,
          name,
          startTime,
          endTime,
          blockNumber: receipt?.blockNumber,
          transactionHash: receipt?.hash,
        };
      } catch (error) {
        throw error;
      }
    });
  }

  async getContestStatistics(query: ContestChartQuery) {
    const { fromDate, toDate } = query;
    const filters: SQL[] = [];

    const baseQuery = db
      .select({
        contestId: contests.id,
        contestName: contests.name,
        candidateCount: sql<number>`COUNT(DISTINCT ${candidates.id})`,
        voteCount: sql<number>`COUNT(DISTINCT ${votes.id})`,
      })
      .from(contests)
      .leftJoin(candidates, eq(candidates.voteId, contests.voteId))
      .leftJoin(votes, eq(votes.voteId, contests.voteId));

    if (fromDate) filters.push(gte(contests.startTime, fromDate));
    if (toDate) filters.push(lte(contests.startTime, toDate));

    if (filters.length > 0) {
      baseQuery.where(and(...filters));
    }

    const results = await baseQuery.groupBy(contests.id, contests.name);

    return {
      labels: results.map((r) => r.contestName),
      datasets: [
        {
          label: 'Number of Candidates',
          data: results.map((r) => r.candidateCount),
        },
        {
          label: 'Total Votes',
          data: results.map((r) => r.voteCount),
        },
      ],
    };
  }

  async getCandidatePieChart(contestId: number) {
    const results = await db
      .select({
        candidateId: candidates.candidateId,
        candidateName: candidates.name,
        voteCount: sql<number>`COUNT(${votes.id})`,
      })
      .from(candidates)
      .leftJoin(
        votes,
        and(
          eq(votes.voteId, candidates.voteId),
          eq(votes.candidateId, candidates.candidateId),
        ),
      )
      .where(eq(candidates.voteId, contestId))
      .groupBy(candidates.candidateId, candidates.name);

    const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

    return {
      labels: results.map((r) => r.candidateName),
      datasets: [
        {
          data: results.map((r) =>
            ((r.voteCount / totalVotes) * 100).toFixed(2),
          ),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
          ],
        },
      ],
    };
  }

  async getCandidateStackedChart(query: ContestCandidateChartQuery) {
    const { contestId, fromDate, toDate } = query;

    const candidatesQuery = await db
      .select({
        candidateId: candidates.candidateId,
        candidateName: candidates.name,
      })
      .from(candidates)
      .where(eq(candidates.voteId, contestId));

    const filters: SQL[] = [eq(candidates.voteId, contestId)];

    if (fromDate) filters.push(gte(votes.createdAt, new Date(fromDate)));
    if (toDate) filters.push(lte(votes.createdAt, new Date(toDate)));

    const results = await db
      .select({
        date: sql<string>`DATE_FORMAT(${votes.createdAt}, '%Y-%m-%d')`.as(
          'date',
        ),
        candidateId: candidates.candidateId,
        candidateName: candidates.name,
        voteCount: sql<number>`COUNT(${votes.id})`,
      })
      .from(candidates)
      .leftJoin(
        votes,
        and(
          eq(votes.voteId, candidates.voteId),
          eq(votes.candidateId, candidates.candidateId),
        ),
      )
      .where(and(...filters))
      .groupBy(
        sql`DATE_FORMAT(${votes.createdAt}, '%Y-%m-%d')`,
        candidates.candidateId,
        candidates.name,
      )
      .orderBy(asc(votes.createdAt));

    // Get all unique dates
    const dates = [
      ...new Set(
        results.map((r) => r.date).filter((date) => date !== 'No votes'),
      ),
    ].sort();

    // Initialize data structure with 0 votes for all candidates on all dates
    const dateGroups: Record<string, Record<string, number>> = {};
    dates.forEach((date) => {
      dateGroups[date] = {};
      candidatesQuery.forEach((candidate) => {
        dateGroups[date][candidate.candidateName] = 0;
      });
    });

    // Fill in actual vote counts
    results.forEach((result) => {
      if (result.date !== 'No votes') {
        dateGroups[result.date][result.candidateName] = result.voteCount;
      }
    });

    return {
      labels: dates,
      datasets: candidatesQuery.map((candidate) => ({
        label: candidate.candidateName,
        data: dates.map(
          (date) => dateGroups[date][candidate.candidateName] || 0,
        ),
        backgroundColor: getRandomColor(),
      })),
    };
  }
}
