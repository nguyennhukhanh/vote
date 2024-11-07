import {
  HttpException,
  type IRequestContext,
  type Middleware,
} from '@thanhhoajs/thanhhoa';
import { adminAuthConfig } from 'src/configs/admin-auth.config';
import type { JwtService } from 'src/modules/auth/jwt.service';

export class AdminGuard {
  constructor(private readonly jwrService: JwtService) {}

  check: Middleware = async (
    context: IRequestContext,
    next: () => Promise<Response>,
  ): Promise<Response> => {
    const token = context.request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      throw new HttpException('Unauthorized', 401);
    }

    try {
      const admin = await this.jwrService.verifyToken(token, adminAuthConfig);
      context.admin = admin;
      return next();
    } catch (error) {
      throw error;
    }
  };
}
