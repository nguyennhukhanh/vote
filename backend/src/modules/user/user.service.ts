import { HttpException } from '@thanhhoajs/thanhhoa';
import { eq } from 'drizzle-orm';
import { db } from 'src/database/db';
import { type User, users } from 'src/database/schemas/users.schema';

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
}
