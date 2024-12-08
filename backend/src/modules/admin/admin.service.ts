import { HttpException } from '@thanhhoajs/thanhhoa';
import type { SQL } from 'drizzle-orm';
import { and, asc, desc, eq, gte, like, lte, or, sql } from 'drizzle-orm';
import { alias, type MySqlSelect } from 'drizzle-orm/mysql-core';
import { db } from 'src/database/db';
import { admins } from 'src/database/schemas/admins.schema';
import { RoleEnum, SortEnum } from 'src/shared/enums';
import { paginate, type PaginatedResult } from 'src/utils/paginate';

import type { AdminQuery } from './dto/admin.query';

export class AdminService {
  async getAdminsWithPagination<T>(
    query: AdminQuery,
  ): Promise<PaginatedResult<T>> {
    const { search, fromDate, toDate, sort, page = 1, limit = 10 } = query;
    const filters: SQL[] = [];

    const createdByAdmin = alias(admins, 'createdByAdmin');

    const queryBuilder = db
      .select({
        id: admins.id,
        email: admins.email,
        fullName: admins.fullName,
        role: admins.role,
        isActive: admins.isActive,
        createdBy: {
          id: sql`${createdByAdmin.id} as createdByAdminId`,
          email: sql`${createdByAdmin.email} as createdByAdminEmail`,
          fullName: sql`${createdByAdmin.fullName} as createdByAdminFullName`,
        },
        createdAt: admins.createdAt,
        updatedAt: admins.updatedAt,
      })
      .from(admins)
      .leftJoin(createdByAdmin, eq(createdByAdmin.id, admins.createdBy));

    if (search) {
      filters.push(
        or(
          like(admins.fullName, `%${search}%`),
          like(admins.email, `%${search}%`),
        ) as SQL,
      );
    }
    if (fromDate) filters.push(gte(admins.createdAt, fromDate));
    if (toDate) filters.push(lte(admins.createdAt, toDate));

    if (filters.length > 0) {
      queryBuilder.where(and(...filters));
    }

    if (sort) {
      (queryBuilder as unknown as MySqlSelect).orderBy(
        sort === SortEnum.ASC ? asc(admins.createdAt) : desc(admins.createdAt),
      );
    }

    return await paginate(db, queryBuilder, page, limit);
  }

  async getAdminByEmail(email: string) {
    const result = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);
    return result[0];
  }

  async createAdmin(
    admin: { id: number },
    dto: {
      email: string;
      fullName: string;
      password: string;
    },
  ) {
    try {
      const { email, fullName, password } = dto;
      const adminExist = await this.getAdminByEmail(dto.email);
      if (adminExist) {
        throw new HttpException('Email already exist', 409);
      }

      const newAdmins = await db
        .insert(admins)
        .values({
          email,
          fullName,
          password,
          createdBy: admin.id,
        })
        .$returningId();
      return {
        id: newAdmins[0].id,
        email: dto.email,
        fullName: dto.fullName,
        role: RoleEnum.ADMIN,
      };
    } catch (error) {
      throw error;
    }
  }
}
