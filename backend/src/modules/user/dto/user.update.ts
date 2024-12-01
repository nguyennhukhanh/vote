import { HttpException } from '@thanhhoajs/thanhhoa';
import { createValidator } from '@thanhhoajs/validator';

function isValidImage(imageName: string): boolean {
  const imageRegex = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
  return imageRegex.test(imageName);
}

const validator = createValidator();
validator.field('fullName').optional().string().length(3, 100);
validator.field('email').optional().string().email();
validator
  .field('walletAddress')
  .optional()
  .min(10)
  .custom((value: string) => {
    if (!value.startsWith('0x') || value.length !== 42) {
      return 'Invalid wallet address';
    }
    return true;
  });
validator
  .field('file')
  .optional()
  .custom(
    (value) =>
      value instanceof File &&
      value.size > 0 &&
      value.size < 10 * 1024 * 1024 &&
      isValidImage(value.name),
    'Invalid file format (Image must be jpg, jpeg, gif, bmp, webp or png and less than 10MB)',
  );

export class UserUpdate {
  fullName?: string;
  email?: string;
  walletAddress?: string;
  file?: File;

  constructor({ fullName, email, walletAddress, file }: Partial<UserUpdate>) {
    this.fullName = fullName;
    this.email = email;
    this.walletAddress = walletAddress;
    this.file = file;

    const errors = validator.validate(this);
    if (errors.length > 0) {
      throw new HttpException('Validation failed', 400, errors);
    }
  }
}
