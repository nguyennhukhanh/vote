import { HttpException } from '@thanhhoajs/thanhhoa';
import type { SQL } from 'drizzle-orm';
import { and, asc, desc, eq, gte, like, lte, or } from 'drizzle-orm';
import { type MySqlSelect } from 'drizzle-orm/mysql-core';
import { db } from 'src/database/db';
import { type User, users } from 'src/database/schemas/users.schema';
import { SortEnum } from 'src/shared/enums';
import { deleteFile, uploadFile } from 'src/utils/file-local';
import { paginate, type PaginatedResult } from 'src/utils/paginate';

import type { UserQuery } from './dto/user.query';
import type { UserUpdate } from './dto/user.update';

export class UserService {
  async getUsersWithPagination<T>(
    query: UserQuery,
  ): Promise<PaginatedResult<T>> {
    const { search, fromDate, toDate, sort, page = 1, limit = 10 } = query;
    const filters: SQL[] = [];

    const queryBuilder = db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        walletAddress: users.walletAddress,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    if (search) {
      filters.push(
        or(
          like(users.fullName, `%${search}%`),
          like(users.email, `%${search}%`),
        ) as SQL,
      );
    }
    if (fromDate) filters.push(gte(users.createdAt, fromDate));
    if (toDate) filters.push(lte(users.createdAt, toDate));

    if (filters.length > 0) {
      queryBuilder.where(and(...filters));
    }

    if (sort) {
      (queryBuilder as unknown as MySqlSelect).orderBy(
        sort === SortEnum.ASC ? asc(users.createdAt) : desc(users.createdAt),
      );
    }

    return await paginate(db, queryBuilder, page, limit);
  }

  async getUserByEmail(email: string): Promise<User> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress))
      .limit(1);
    return result[0];
  }

  async createUser(dto: {
    email?: string;
    walletAddress?: string;
    fullName?: string;
  }): Promise<User> {
    const { email, walletAddress, fullName } = dto;
    try {
      if (email) {
        const userExist = await this.getUserByEmail(email);
        if (userExist) {
          throw new HttpException('Email already exist', 409);
        }
      }

      if (walletAddress) {
        const userExist = await this.getUserByWalletAddress(walletAddress);
        if (userExist) {
          throw new HttpException('Wallet address already exist', 409);
        }
      }

      const newUsers = await db.insert(users).values(dto).$returningId();
      return {
        id: newUsers[0].id,
        email: email ?? null,
        fullName: fullName ?? null,
        walletAddress: walletAddress ?? null,
        nonce: 0,
        avatarUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      throw error;
    }
  }

  async updateNonce(walletAddress: string, nonce: number): Promise<void> {
    try {
      await db
        .update(users)
        .set({ nonce })
        .where(eq(users.walletAddress, walletAddress));
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(user: User, dto: UserUpdate): Promise<boolean> {
    const { fullName, email, walletAddress, file } = dto;
    const { email: currentEmail, walletAddress: currentWalletAddress } = user;
    let avatarUrl: string | null = null;

    if (file) {
      if (user.avatarUrl) deleteFile(user.avatarUrl);
      avatarUrl = await uploadFile(file, 'images/avatars');
    }

    if (email && email !== currentEmail) {
      const userExist = await this.getUserByEmail(email);
      if (userExist) {
        throw new HttpException('Email already exist', 409);
      }
    }

    if (walletAddress && walletAddress !== currentWalletAddress) {
      const userExist = await this.getUserByWalletAddress(walletAddress);
      if (userExist) {
        throw new HttpException('Wallet address already exist', 409);
      }
    }

    const updateData: Partial<User> = {
      fullName,
      email,
      walletAddress,
      avatarUrl,
    };
    Object.keys(updateData).forEach(
      (key) =>
        updateData[key as keyof User] === undefined &&
        delete updateData[key as keyof User],
    );

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id));
    return result[0].affectedRows > 0;
  }
}
