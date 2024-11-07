import { HttpException } from '@thanhhoajs/thanhhoa';
import { createValidator } from '@thanhhoajs/validator';

const validator = createValidator();
validator.field('email').required().email();
validator.field('password').required().min(6);

export class ValidateAdminDto {
  email: string;
  password: string;

  constructor(params: { email: string; password: string }) {
    this.email = params.email;
    this.password = params.password;
    this.validate();
  }

  private validate() {
    const errors = validator.validate(this);
    if (errors.length > 0) {
      throw new HttpException('Validation failed', 400, errors);
    }
  }
}
