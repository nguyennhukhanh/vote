import { AdminGuard } from 'src/common/middlewares/admin-guard.middleware';
import { RoleGuard } from 'src/common/middlewares/role-guard.middleware';
import { UserGuard } from 'src/common/middlewares/user-guard.middleware';
import { RoleEnum } from 'src/shared/enums';

import { jwtService } from './shared.service';

const adminGuardInstance = new AdminGuard(jwtService);
const userGuardInstance = new UserGuard(jwtService);

/**
 * Creates a middleware that checks if the request has a valid token,
 * according to the given role.
 *
 * @param {RoleEnum} role The role to check
 */
export const GUARD = (role: RoleEnum) => {
  if (role === RoleEnum.SUPER_ADMIN || role === RoleEnum.ADMIN) {
    return adminGuardInstance.check;
  } else {
    return userGuardInstance.check;
  }
};

/**
 * Creates a middleware that checks if the request has a valid token,
 * according to the given role.
 *
 * @param {RoleEnum} role The role to check
 */
export const ROLE_GUARD = (role: RoleEnum) => new RoleGuard(role).check;
