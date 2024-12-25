import { HttpException } from '@thanhhoajs/thanhhoa';
import { eq, sql } from 'drizzle-orm';
import moment from 'moment';
import { adminAuthConfig } from 'src/configs/admin-auth.config';
import { userAuthConfig } from 'src/configs/user-auth.config';
import { db } from 'src/database/db';
import { adminSessions } from 'src/database/schemas/admin-sessions.schema';
import { admins } from 'src/database/schemas/admins.schema';
import {
  type UserSession,
  userSessions,
} from 'src/database/schemas/user-sessions.schema';
import { users } from 'src/database/schemas/users.schema';

export class SessionService {
  async createUserSession(options: { sessionId?: string; userId: number }) {
    const { sessionId, userId } = options;
    let userSessionExists: UserSession[] = [];

    if (sessionId) {
      userSessionExists = await db
        .select()
        .from(userSessions)
        .where(eq(userSessions.id, sessionId))
        .limit(1);
    } else if (userId) {
      userSessionExists = await db
        .select()
        .from(userSessions)
        .where(eq(userSessions.userId, userId))
        .limit(1);
    }

    // If a session exist, delete it
    if (userSessionExists.length > 0) {
      await this.deleteUserSession({ userId: userSessionExists[0].userId });
    }

    // Create a new session
    const newSession = {
      userId,
      expiresAt: moment()
        .utc()
        .add(Number(userAuthConfig.refreshTokenLifetime), 'seconds')
        .toDate(),
    };

    const result = await db
      .insert(userSessions)
      .values(newSession)
      .$returningId();

    return {
      id: result[0].id,
      ...newSession,
    };
  }

  async getUserSession(sessionId: string) {
    const sessionsExist = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        walletAddress: users.walletAddress,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(userSessions)
      .where(
        sql`${userSessions.id} = ${sessionId} AND ${
          userSessions.expiresAt
        } > ${moment().utc().toDate()}`,
      )
      .innerJoin(users, eq(userSessions.userId, users.id))
      .limit(1);

    if (sessionsExist.length > 0) {
      return sessionsExist[0];
    }

    throw new HttpException('Session not found', 404);
  }

  async deleteUserSession(
    options: Partial<{ sessionId: string; userId: number }>,
  ): Promise<boolean> {
    const { sessionId, userId } = options;
    const whereClause = sessionId
      ? eq(userSessions.id, sessionId)
      : userId
      ? eq(userSessions.userId, userId)
      : null;

    if (!whereClause) {
      throw new HttpException(
        'Either id or userId must be provided for deletion.',
        500,
      );
    }

    const result = await db.delete(userSessions).where(whereClause);

    return result[0].affectedRows > 0;
  }

  async createAdminSession(options: { sessionId?: string; adminId: number }) {
    const { sessionId, adminId } = options;
    let adminSessionExists: any[] = [];

    if (sessionId) {
      adminSessionExists = await db
        .select()
        .from(adminSessions)
        .where(eq(adminSessions.id, sessionId))
        .limit(1);
    } else if (adminId) {
      adminSessionExists = await db
        .select()
        .from(adminSessions)
        .where(eq(adminSessions.adminId, adminId))
        .limit(1);
    }

    // If a session exist, delete it
    if (adminSessionExists.length > 0) {
      await this.deleteAdminSession({ adminId: adminSessionExists[0].adminId });
    }

    // Create a new session
    const newSession = {
      adminId,
      expiresAt: moment()
        .utc()
        .add(Number(adminAuthConfig.refreshTokenLifetime), 'seconds')
        .toDate(),
    };

    const result = await db
      .insert(adminSessions)
      .values(newSession)
      .$returningId();

    return {
      id: result[0].id,
      ...newSession,
    };
  }

  async getAdminSession(sessionId: string) {
    const sessionsExist = await db
      .select({
        id: admins.id,
        email: admins.email,
        fullName: admins.fullName,
        role: admins.role,
        createdAt: admins.createdAt,
        updatedAt: admins.updatedAt,
      })
      .from(adminSessions)
      .where(
        sql`${adminSessions.id} = ${sessionId} AND ${
          adminSessions.expiresAt
        } > ${moment().utc().toDate()}`,
      )
      .innerJoin(admins, eq(adminSessions.adminId, admins.id))
      .limit(1);

    if (sessionsExist.length > 0) {
      return sessionsExist[0];
    }

    throw new HttpException('Session not found', 404);
  }

  async deleteAdminSession(
    options: Partial<{ sessionId: string; adminId: number }>,
  ): Promise<boolean> {
    const { sessionId, adminId } = options;
    const whereClause = sessionId
      ? eq(adminSessions.id, sessionId)
      : adminId
      ? eq(adminSessions.adminId, adminId)
      : null;

    if (!whereClause) {
      throw new HttpException(
        'Either id or adminId must be provided for deletion.',
        500,
      );
    }

    const result = await db.delete(adminSessions).where(whereClause);

    return result[0].affectedRows > 0;
  }
}
