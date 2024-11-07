import { HttpException } from '@thanhhoajs/thanhhoa';
import { createValidator } from '@thanhhoajs/validator';

const validator = createValidator();
validator
  .field('walletAddress')
  .required()
  .min(10)
  .custom((value: string) => {
    if (!value.startsWith('0x') || value.length !== 42) {
      return 'Invalid wallet address';
    }
    return true;
  });
validator.field('signature').required().min(10).max(600);

export class ValidateUserWalletDto {
  walletAddress: string;
  signature: string;

  constructor(walletAddress: string, signature: string) {
    this.walletAddress = walletAddress;
    this.signature = signature;
    const errors = validator.validate(this);
    if (errors.length > 0) {
      throw new HttpException('Validation failed', 400, errors);
    }
  }
}
