import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';
import { AdminRefreshTokenGuard } from 'src/common/middlewares/admin-refresh-token-guard.middleware';
import { UserRefreshTokenGuard } from 'src/common/middlewares/user-refresh-token-guard.middleware';
import { RoleEnum } from 'src/shared/enums';

import { GUARD, ROLE_GUARD } from '../services/guard.service';
import {
  adminService,
  hashService,
  jwtService,
  sessionService,
  userAuthService,
  userService,
} from '../services/shared.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { UserAuthController } from './user-auth.controller';
import { GoogleAuthService } from './user-google-auth.service';
import { WalletService } from './user-wallet.service';

export class AuthModule {
  constructor(app: ThanhHoa) {
    const walletService = new WalletService(userService, userAuthService);
    const adminAuthService = new AdminAuthService(
      adminService,
      hashService,
      jwtService,
      sessionService,
    );
    const googleAuthService = new GoogleAuthService(
      userService,
      userAuthService,
    );
    const userAuthController = new UserAuthController(
      userAuthService,
      googleAuthService,
      walletService,
    );
    const adminAuthController = new AdminAuthController(adminAuthService);
    const userRefreshTokenGuard = new UserRefreshTokenGuard(jwtService);
    const adminRefreshTokenGuard = new AdminRefreshTokenGuard(jwtService);

    app.post('/user/auth/nonce', (context: IRequestContext) =>
      userAuthController.getNonce(context),
    );

    app.post('/user/auth/login/wallet', (context: IRequestContext) =>
      userAuthController.loginWithWallet(context),
    );

    app.post('/user/auth/login/google', (context: IRequestContext) =>
      userAuthController.loginWithGoogle(context),
    );

    app.get(
      '/user/auth/logout',
      userRefreshTokenGuard.check,
      (context: IRequestContext) => userAuthController.logout(context),
    );

    app.get(
      '/user/auth/refresh-token',
      userRefreshTokenGuard.check,
      (context: IRequestContext) => userAuthController.refreshToken(context),
    );

    app.post('/admin/auth/login', (context: IRequestContext) =>
      adminAuthController.login(context),
    );

    app.post(
      '/admin/auth/register',
      GUARD(RoleEnum.ADMIN),
      ROLE_GUARD(RoleEnum.SUPER_ADMIN),
      (context: IRequestContext) => adminAuthController.register(context),
    );

    app.get(
      '/admin/auth/logout',
      adminRefreshTokenGuard.check,
      (context: IRequestContext) => adminAuthController.logout(context),
    );

    app.get(
      '/admin/auth/refresh-token',
      adminRefreshTokenGuard.check,
      (context: IRequestContext) => adminAuthController.refreshToken(context),
    );
  }
}
