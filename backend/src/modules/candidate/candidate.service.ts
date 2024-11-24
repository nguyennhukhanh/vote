import { HttpException } from '@thanhhoajs/thanhhoa';
import type { SQL } from 'drizzle-orm';
import { and, asc, desc, eq, gte, like, lte, or, sql } from 'drizzle-orm';
import type { MySqlSelect } from 'drizzle-orm/mysql-core';
import type { Contract } from 'ethers';
import { ethers, JsonRpcProvider, type Provider } from 'ethers';
import fs from 'fs';
import { appConfig } from 'src/configs/app.config';
import { db } from 'src/database/db';
import type { Admin } from 'src/database/schemas/admins.schema';
import { candidates } from 'src/database/schemas/candidates.schema';
import { contests } from 'src/database/schemas/contests.schema';
import { votes } from 'src/database/schemas/votes.schema';
import { SortEnum } from 'src/shared/enums';
import { paginate, type PaginatedResult } from 'src/utils/paginate';

import type { CandidateCreate } from './dto/candidate.create';
import type { CandidateQuery } from './dto/candidate.query';

export class CandidateService {
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

  async getCandidatesWithPagination<T>(
    query: CandidateQuery,
  ): Promise<PaginatedResult<T>> {
    const {
      voteId,
      search,
      fromDate,
      toDate,
      sort,
      page = 1,
      limit = 10,
    } = query;
    const filters: SQL[] = [];

    const queryBuilder = db
      .select({
        id: candidates.id,
        candidateId: candidates.candidateId,
        name: candidates.name,
        contests: {
          id: sql`${contests.id} as contestId`,
          name: sql`${contests.name} as contestName`,
          startTime: contests.startTime,
          endTime: contests.endTime,
          voteId: contests.voteId,
        },
        totalVotes: sql`COUNT(DISTINCT ${votes.id})`,
        blockTimestamp: candidates.blockTimestamp,
        blockNumber: candidates.blockNumber,
        transactionHash: candidates.transactionHash,
        createdAt: candidates.createdAt,
      })
      .from(candidates)
      .innerJoin(contests, eq(candidates.voteId, contests.voteId))
      .leftJoin(
        votes,
        and(
          eq(votes.voteId, candidates.voteId),
          eq(votes.candidateId, candidates.candidateId),
        ),
      )
      .groupBy(candidates.id);

    if (voteId) filters.push(eq(candidates.voteId, voteId));
    if (search) {
      filters.push(or(like(candidates.name, `%${search}%`)) as SQL);
    }
    if (fromDate) filters.push(gte(candidates.blockTimestamp, fromDate));
    if (toDate) filters.push(lte(candidates.blockTimestamp, toDate));

    if (filters.length > 0) {
      queryBuilder.where(and(...filters));
    }

    if (sort) {
      (queryBuilder as unknown as MySqlSelect).orderBy(
        sort === SortEnum.ASC
          ? asc(candidates.blockTimestamp)
          : desc(candidates.blockTimestamp),
      );
    }

    return await paginate(db, queryBuilder, page, limit);
  }

  async getCandidateById(id: number) {
    const [candidate] = await db
      .select({
        id: candidates.id,
        candidateId: candidates.candidateId,
        name: candidates.name,
        contests: {
          id: sql`${contests.id} as contestId`,
          name: sql`${contests.name} as contestName`,
          startTime: contests.startTime,
          endTime: contests.endTime,
          voteId: contests.voteId,
        },
        blockTimestamp: candidates.blockTimestamp,
        blockNumber: candidates.blockNumber,
        transactionHash: candidates.transactionHash,
        createdAt: candidates.createdAt,
        updatedAt: candidates.updatedAt,
      })
      .from(candidates)
      .innerJoin(contests, eq(candidates.voteId, contests.voteId))
      .where(eq(candidates.id, id))
      .limit(1)
      .execute();

    if (!candidate) throw new HttpException('Candidate not found', 404);

    return candidate;
  }

  async createCandidate(admin: Admin, voteId: number, dto: CandidateCreate) {
    const { name } = dto;

    return await db.transaction(async (tx) => {
      try {
        const [voteExist] = await tx
          .select({ id: contests.id, startTime: contests.startTime })
          .from(contests)
          .where(eq(contests.voteId, voteId))
          .limit(1)
          .execute();

        if (!voteExist) throw new HttpException('Contest not found', 404);

        if (new Date(voteExist.startTime) < new Date())
          throw new HttpException(
            'Cannot add candidates after voting has started',
            400,
          );

        const voteIdTx = await this._contract.addCandidate(voteId, name);

        const receipt = await voteIdTx.wait();

        const newCandidate = await tx
          .insert(candidates)
          .values({
            name,
            voteId,
            blockNumber: receipt?.blockNumber,
            transactionHash: receipt?.hash,
          })
          .$returningId();

        return {
          id: newCandidate[0].id,
          name,
          voteId,
          blockNumber: receipt?.blockNumber,
          transactionHash: receipt?.hash,
        };
      } catch (error) {
        throw error;
      }
    });
  }
}
