import type { SQL } from 'drizzle-orm';
import { and, asc, desc, eq, gte, like, lte, or, sql } from 'drizzle-orm';
import type { MySqlSelect } from 'drizzle-orm/mysql-core';
import { db } from 'src/database/db';
import { candidates } from 'src/database/schemas/candidates.schema';
import { contests } from 'src/database/schemas/contests.schema';
import { users } from 'src/database/schemas/users.schema';
import { votes } from 'src/database/schemas/votes.schema';
import { SortEnum } from 'src/shared/enums';
import { paginate, type PaginatedResult } from 'src/utils/paginate';

import type { VoteQuery } from './dto/vote.query';

export class VoteService {
  async getVotesWithPagination<T>(
    query: VoteQuery,
  ): Promise<PaginatedResult<T>> {
    const { search, fromDate, toDate, sort, page = 1, limit = 10 } = query;
    const filters: SQL[] = [];

    const queryBuilder = db
      .select({
        id: votes.id,
        contest: {
          id: sql`${contests.id} as contestId`,
          name: sql`${contests.name} as contestName`,
          startTime: contests.startTime,
          endTime: contests.endTime,
          voteId: contests.voteId,
        },
        candidate: {
          id: sql`${candidates.id} as responderCandidateId`,
          name: candidates.name,
          candidateId: candidates.candidateId,
        },
        voter: {
          id: sql`${users.id} as voterId`,
          fullName: users.fullName,
          email: users.email,
          walletAddress: users.walletAddress,
          createdAt: users.createdAt,
        },
        blockTimestamp: votes.blockTimestamp,
        blockNumber: votes.blockNumber,
        transactionHash: votes.transactionHash,
      })
      .from(votes)
      .innerJoin(contests, eq(votes.voteId, contests.voteId))
      .innerJoin(candidates, eq(votes.candidateId, candidates.candidateId))
      .innerJoin(users, eq(votes.voterAddress, users.walletAddress));

    if (search) {
      filters.push(
        or(
          like(contests.name, `%${search}%`),
          like(candidates.name, `%${search}%`),
        ) as SQL,
      );
    }
    if (fromDate) filters.push(gte(votes.blockTimestamp, fromDate));
    if (toDate) filters.push(lte(votes.blockTimestamp, toDate));

    if (filters.length > 0) {
      queryBuilder.where(and(...filters));
    }

    if (sort) {
      (queryBuilder as unknown as MySqlSelect).orderBy(
        sort === SortEnum.ASC
          ? asc(votes.blockTimestamp)
          : desc(votes.blockTimestamp),
      );
    }

    return await paginate(db, queryBuilder, page, limit);
  }
}
