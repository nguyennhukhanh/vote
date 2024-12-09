import type { SQL } from 'drizzle-orm';
import { and, asc, desc, eq, gte, like, lte, or, sql } from 'drizzle-orm';
import type { MySqlSelect } from 'drizzle-orm/mysql-core';
import type { Contract } from 'ethers';
import { ethers, JsonRpcProvider, type Provider } from 'ethers';
import fs from 'fs';
import { appConfig } from 'src/configs/app.config';
import { db } from 'src/database/db';
import { type Admin, admins } from 'src/database/schemas/admins.schema';
import { candidates } from 'src/database/schemas/candidates.schema';
import { contests } from 'src/database/schemas/contests.schema';
import { votes } from 'src/database/schemas/votes.schema';
import { SortEnum } from 'src/shared/enums';
import { dateToUnixTimestamp } from 'src/utils/moment';
import { paginate, type PaginatedResult } from 'src/utils/paginate';

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
            startTime: new Date(startTime),
            endTime: new Date(endTime),
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
}
