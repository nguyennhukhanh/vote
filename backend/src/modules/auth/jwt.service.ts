import { HttpException } from '@thanhhoajs/thanhhoa';
import * as jwt from 'jsonwebtoken';
import { adminAuthConfig } from 'src/configs/admin-auth.config';
import { userAuthConfig } from 'src/configs/user-auth.config';
import type { JwtPayloadType, TokensType } from 'src/shared/types';

import type { SessionService } from '../session/session.service';

export class JwtService {
  constructor(private readonly sessionService: SessionService) {}
  private async signTokens(
    payload: { session: string },
    authConfig: typeof userAuthConfig | typeof adminAuthConfig,
  ): Promise<TokensType> {
    const accessToken = jwt.sign(
      payload,
      authConfig.accessTokenSecret as string,
      {
        expiresIn: authConfig.accessTokenLifetime,
      },
    );

    const refreshToken = jwt.sign(
      payload,
      authConfig.refreshTokenSecret as string,
      {
        expiresIn: authConfig.refreshTokenLifetime,
      },
    );

    const expiresAt =
      Math.floor(Date.now()) + authConfig.accessTokenLifetime * 1000; // in milliseconds

    return { accessToken, refreshToken, expiresAt };
  }

  async signUserTokens(payload: { session: string }): Promise<TokensType> {
    return this.signTokens(payload, userAuthConfig);
  }

  async signAdminTokens(payload: { session: string }): Promise<TokensType> {
    return this.signTokens(payload, adminAuthConfig);
  }

  async verifyToken(
    token: string,
    authConfig: typeof userAuthConfig | typeof adminAuthConfig,
  ) {
    try {
      const decoded = jwt.verify(
        token,
        authConfig.accessTokenSecret as string,
      ) as JwtPayloadType;

      return authConfig === userAuthConfig
        ? await this.sessionService.getUserSession(decoded.session)
        : await this.sessionService.getAdminSession(decoded.session);
    } catch (error) {
      throw new HttpException('Invalid token', 401);
    }
  }

  async verifyRefreshToken(
    token: string,
    authConfig: typeof userAuthConfig | typeof adminAuthConfig,
  ) {
    try {
      const decoded = jwt.verify(
        token,
        authConfig.refreshTokenSecret as string,
      ) as JwtPayloadType;

      return authConfig === userAuthConfig
        ? await this.sessionService.getUserSession(decoded.session)
        : await this.sessionService.getAdminSession(decoded.session);
    } catch (error) {
      throw new HttpException('Invalid token', 401);
    }
  }
}
