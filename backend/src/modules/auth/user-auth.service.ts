import { type IRequestContext } from '@thanhhoajs/thanhhoa';
import type { User } from 'src/database/schemas/users.schema';
import type { TokensType } from 'src/shared/types';

import type { SessionService } from '../session/session.service';
import type { JwtService } from './jwt.service';

export class UserAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  async createUserSession(
    user: User,
  ): Promise<{ user: User; tokens: TokensType }> {
    try {
      const sessionExist = await this.sessionService.createUserSession({
        userId: user.id,
      });

      const tokens = await this.jwtService.signUserTokens({
        session: sessionExist.id,
      });

      return {
        user,
        tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(context: IRequestContext): Promise<boolean> {
    try {
      const user = context.user;
      return await this.sessionService.deleteUserSession({
        userId: user.id,
      });
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(
    context: IRequestContext,
  ): Promise<{ user: User; tokens: TokensType }> {
    try {
      const user: User = context.user;

      return await this.createUserSession(user);
    } catch (error) {
      throw error;
    }
  }
}
