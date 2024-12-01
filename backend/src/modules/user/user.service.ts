import { HttpException } from '@thanhhoajs/thanhhoa';
import { eq } from 'drizzle-orm';
import { db } from 'src/database/db';
import { type User, users } from 'src/database/schemas/users.schema';
import { deleteFile, uploadFile } from 'src/utils/file-local';

import type { UserUpdate } from './dto/user.update';

export class UserService {
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
