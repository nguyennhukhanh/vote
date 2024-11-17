import type { SQL } from 'drizzle-orm';
import { and, asc, desc, eq, gte, like, lte, or, sql } from 'drizzle-orm';
import type { MySqlSelect } from 'drizzle-orm/mysql-core';
import { db } from 'src/database/db';
import { admins } from 'src/database/schemas/admins.schema';
import { contests } from 'src/database/schemas/contests.schema';
import { SortEnum } from 'src/shared/enums';
import { paginate, type PaginatedResult } from 'src/utils/paginate';

import type { ContestQuery } from './dto/contest.query';

export class ContestService {
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
}
