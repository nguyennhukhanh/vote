import { HttpException } from '@thanhhoajs/thanhhoa';
import { createValidator } from '@thanhhoajs/validator';

const validator = createValidator();
validator.field('email').required().email();
validator.field('password').required().min(6);
validator.field('fullName').required().string().min(3).max(50);

export class CreateAdminDto {
  email: string;
  password: string;
  fullName: string;

  constructor(params: { email: string; fullName: string; password: string }) {
    this.email = params.email;
    this.fullName = params.fullName;
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
