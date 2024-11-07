import {
  HttpException,
  type IRequestContext,
  type Middleware,
} from '@thanhhoajs/thanhhoa';
import { userAuthConfig } from 'src/configs/user-auth.config';
import type { JwtService } from 'src/modules/auth/jwt.service';

export class UserGuard {
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
      const user = await this.jwrService.verifyToken(token, userAuthConfig);
      context.user = user;
      return next();
    } catch (error) {
      throw error;
    }
  };
}
