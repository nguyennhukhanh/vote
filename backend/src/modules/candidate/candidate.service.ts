import type { SQL } from 'drizzle-orm';
import { and, asc, desc, eq, gte, like, lte, or, sql } from 'drizzle-orm';
import type { MySqlSelect } from 'drizzle-orm/mysql-core';
import { db } from 'src/database/db';
import { candidates } from 'src/database/schemas/candidates.schema';
import { contests } from 'src/database/schemas/contests.schema';
import { SortEnum } from 'src/shared/enums';
import { paginate, type PaginatedResult } from 'src/utils/paginate';

import type { CandidateQuery } from './dto/candidate.query';

export class CandidateService {
  async getCandidatesWithPagination<T>(
    query: CandidateQuery,
  ): Promise<PaginatedResult<T>> {
    const { search, fromDate, toDate, sort, page = 1, limit = 10 } = query;
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
        blockTimestamp: candidates.blockTimestamp,
        blockNumber: candidates.blockNumber,
        transactionHash: candidates.transactionHash,
        createdAt: candidates.createdAt,
      })
      .from(candidates)
      .innerJoin(contests, eq(candidates.voteId, contests.voteId));

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
}
