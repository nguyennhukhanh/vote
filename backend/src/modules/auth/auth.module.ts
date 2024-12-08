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

    app.group('/user', (app) => {
      app.post('/auth/nonce', (context: IRequestContext) =>
        userAuthController.getNonce(context),
      );

      app.post('/auth/login/wallet', (context: IRequestContext) =>
        userAuthController.loginWithWallet(context),
      );

      app.post('/auth/login/google', (context: IRequestContext) =>
        userAuthController.loginWithGoogle(context),
      );

      app.get(
        '/auth/logout',
        userRefreshTokenGuard.check,
        (context: IRequestContext) => userAuthController.logout(context),
      );

      app.get(
        '/auth/refresh-token',
        userRefreshTokenGuard.check,
        (context: IRequestContext) => userAuthController.refreshToken(context),
      );
    });

    app.group('/admin', (app) => {
      app.post('/auth/login', (context: IRequestContext) =>
        adminAuthController.login(context),
      );

      app.post(
        '/auth/register',
        GUARD(RoleEnum.ADMIN),
        ROLE_GUARD(RoleEnum.SUPER_ADMIN),
        (context: IRequestContext) => adminAuthController.register(context),
      );

      app.get(
        '/auth/logout',
        adminRefreshTokenGuard.check,
        (context: IRequestContext) => adminAuthController.logout(context),
      );

      app.get(
        '/auth/refresh-token',
        adminRefreshTokenGuard.check,
        (context: IRequestContext) => adminAuthController.refreshToken(context),
      );
    });
  }
}
