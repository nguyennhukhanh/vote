import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { customResponse } from 'src/utils/custom-response';

import { ValidateUserSocialDto } from './dto/user-social.validate';
import { ValidateUserWalletDto } from './dto/user-wallet.validate';
import { CreateWalletDto } from './dto/wallet.create';
import type { UserAuthService } from './user-auth.service';
import type { GoogleAuthService } from './user-google-auth.service';
import type { WalletService } from './user-wallet.service';

export class UserAuthController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * @swagger
   * paths:
   *   /api/user/auth/nonce:
   *     post:
   *       tags:
   *         - auth/user
   *       summary: Get nonce
   *       description: Get nonce
   *       requestBody:
   *         required: true
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 walletAddress:
   *                   type: string
   *               required:
   *                 - walletAddress
   *       responses:
   *         200:
   *           description: Success
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   nonce:
   *                     type: number
   */
  async getNonce(context: IRequestContext): Promise<Response> {
    try {
      const { walletAddress } = await context.request.json();
      const dto = new CreateWalletDto(walletAddress);

      const user = await this.walletService.getNonce(dto.walletAddress);

      return customResponse(user, 201);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * paths:
   *   /api/user/auth/login/wallet:
   *     post:
   *       tags:
   *         - auth/user
   *       summary: Login with wallet
   *       description: Login with wallet
   *       requestBody:
   *         required: true
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 walletAddress:
   *                   type: string
   *                 signature:
   *                   type: string
   *               required:
   *                 - walletAddress
   *                 - signature
   *       responses:
   *         200:
   *           description: Success
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   user:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: number
   *                       email:
   *                         type: string
   *                       fullName:
   *                         type: string
   *                       walletAddress:
   *                         type: string
   *                       nonce:
   *                         type: number
   *                       createdAt:
   *                         type: string
   *                       updatedAt:
   *                         type: string
   *                   tokens:
   *                        type: object
   *                        properties:
   *                          accessToken:
   *                            type: string
   *                          refreshToken:
   *                            type: string
   *                          expiresAt:
   *                            type: number
   */
  async loginWithWallet(context: IRequestContext): Promise<Response> {
    try {
      const { walletAddress, signature } = await context.request.json();
      const dto = new ValidateUserWalletDto(walletAddress, signature);

      const user = await this.walletService.login(dto);

      return customResponse(user, 201);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * paths:
   *   /api/user/auth/login/google:
   *     post:
   *       tags:
   *         - auth/user
   *       summary: Login with google
   *       description: Login with google
   *       requestBody:
   *         required: true
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *               required:
   *                 - accessToken
   *       responses:
   *         200:
   *           description: Success
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   user:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: number
   *                       email:
   *                         type: string
   *                       fullName:
   *                         type: string
   *                       walletAddress:
   *                         type: string
   *                       nonce:
   *                         type: number
   *                       createdAt:
   *                         type: string
   *                       updatedAt:
   *                         type: string
   *                   tokens:
   *                        type: object
   *                        properties:
   *                          accessToken:
   *                            type: string
   *                          refreshToken:
   *                            type: string
   *                          expiresAt:
   *                            type: number
   */
  async loginWithGoogle(context: IRequestContext): Promise<Response> {
    try {
      const { accessToken } = await context.request.json();
      const dto = new ValidateUserSocialDto(accessToken);

      const result = await this.googleAuthService.login(dto);

      return customResponse(result, 201);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * paths:
   *   /api/user/auth/logout:
   *     get:
   *       security:
   *         - bearerAuth: []
   *       tags:
   *         - auth/user
   *       summary: Logout
   *       description: Logout
   *       responses:
   *         200:
   *           description: Success
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   isLogout:
   *                     type: boolean
   *                     example: true
   *         401:
   *           description: Unauthorized
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   meta:
   *                     type: object
   *                     properties:
   *                       status:
   *                         type: number
   *                         example: 401
   *                       message:
   *                         type: string
   *                         example: Unauthorized
   */
  async logout(context: IRequestContext): Promise<Response> {
    try {
      const isLogout = await this.userAuthService.logout(context);
      return customResponse(isLogout);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @swagger
   * paths:
   *   /api/user/auth/refresh-token:
   *     get:
   *       security:
   *         - bearerAuth: []
   *       tags:
   *         - auth/user
   *       summary: Refresh token
   *       description: Refresh token
   *       responses:
   *         200:
   *           description: Success
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   user:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: number
   *                       email:
   *                         type: string
   *                       fullName:
   *                         type: string
   *                       createdAt:
   *                         type: string
   *                       updatedAt:
   *                         type: string
   *                   tokens:
   *                       type: object
   *                       properties:
   *                         accessToken:
   *                           type: string
   *                         refreshToken:
   *                           type: string
   *                         expiresAt:
   *                           type: number
   *         404:
   *           description: Not found
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   meta:
   *                     type: object
   *                     properties:
   *                       status:
   *                         type: number
   *                       message:
   *                         type: string
   *                         example: Not found
   */
  async refreshToken(context: IRequestContext): Promise<Response> {
    try {
      const user = await this.userAuthService.refreshToken(context);
      return customResponse(user);
    } catch (error) {
      throw error;
    }
  }
}
