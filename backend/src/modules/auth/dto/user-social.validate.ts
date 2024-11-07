import { HttpException } from '@thanhhoajs/thanhhoa';
import { createValidator } from '@thanhhoajs/validator';

const validator = createValidator();
validator.field('accessToken').required().min(10);

export class ValidateUserSocialDto {
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    const errors = validator.validate(this);
    if (errors.length > 0) {
      throw new HttpException('Validation failed', 400, errors);
    }
  }
}
