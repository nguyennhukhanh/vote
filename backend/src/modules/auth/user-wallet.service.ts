import { HttpException } from '@thanhhoajs/thanhhoa';
import { userAuthConfig } from 'src/configs/user-auth.config';
import type { User } from 'src/database/schemas/users.schema';
import type { TokensType } from 'src/shared/types';
import Web3 from 'web3';

import type { UserService } from '../user/user.service';
import type { ValidateUserWalletDto } from './dto/user-wallet.validate';
import type { UserAuthService } from './user-auth.service';

export class WalletService {
  private web3: Web3;
  constructor(
    private readonly userService: UserService,
    private readonly userAuthService: UserAuthService,
  ) {
    this.web3 = new Web3();
  }

  async getNonce(walletAddress: string): Promise<number> {
    const userWalletExist = await this.getUserByWallet(walletAddress);
    if (!userWalletExist) return -1;

    const nonce = Number(userWalletExist.nonce) + 1;
    await this.userService.updateNonce(walletAddress, nonce);
    return nonce;
  }

  async login(
    dto: ValidateUserWalletDto,
  ): Promise<{ user: User; tokens: TokensType }> {
    let userExist = await this.getUserByWallet(dto.walletAddress);

    const nonce = Number(userExist?.nonce) >= 0 ? Number(userExist.nonce) : -1;
    await this.validateSignature(dto, nonce);

    userExist = await this.walletHandler(dto, nonce, userExist);

    return await this.userAuthService.createUserSession(userExist);
  }

  private async walletHandler(
    dto: ValidateUserWalletDto,
    nonce: number,
    userExist: User,
  ): Promise<User> {
    const { walletAddress } = dto;

    if (userExist) {
      await this.userService.updateNonce(walletAddress, nonce);
      userExist.nonce = nonce;

      return userExist;
    }

    return await this.userService.createUser({
      walletAddress: dto.walletAddress,
    });
  }

  private getSignMessage(nonce: number): string {
    return userAuthConfig.signatureMessage + ` Nonce: ${nonce}`;
  }

  private async validateSignature(
    data: ValidateUserWalletDto,
    nonce: number,
  ): Promise<void> {
    try {
      const signMessage = this.getSignMessage(nonce);
      const wallet = this.web3.eth.accounts.recover(
        signMessage,
        data.signature,
      );

      if (!wallet || wallet.toLowerCase() != data.walletAddress.toLowerCase())
        throw new HttpException('Invalid signature', 400);
    } catch (error) {
      throw error;
    }
  }

  private async getUserByWallet(wallet: string): Promise<User> {
    return await this.userService.getUserByWalletAddress(wallet);
  }
}
