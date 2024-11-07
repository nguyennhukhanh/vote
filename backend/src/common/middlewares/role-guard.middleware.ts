import {
  HttpException,
  type IRequestContext,
  type Middleware,
} from '@thanhhoajs/thanhhoa';
import type { RoleEnum } from 'src/shared/enums';

export class RoleGuard {
  private requiredRole: RoleEnum;

  constructor(role: RoleEnum) {
    this.requiredRole = role;
  }

  check: Middleware = async (
    context: IRequestContext,
    next: () => Promise<Response>,
  ): Promise<Response> => {
    try {
      const { admin } = context;
      if (admin.role !== this.requiredRole)
        throw new HttpException('Forbidden access', 403);

      return next();
    } catch (error) {
      throw error;
    }
  };
}
