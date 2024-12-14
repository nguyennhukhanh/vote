import { HttpException } from '@thanhhoajs/thanhhoa';
import { createValidator } from '@thanhhoajs/validator';

const validator = createValidator();
validator.field('message').required().min(10).max(1000).trim();

export class ChatCreateDto {
  message: string;

  constructor(message: string) {
    this.message = message;
    const errors = validator.validate(this);
    if (errors.length > 0) {
      throw new HttpException('Validation failed', 400, errors);
    }
  }
}
