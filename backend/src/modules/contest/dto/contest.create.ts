import { HttpException } from '@thanhhoajs/thanhhoa';
import { createValidator } from '@thanhhoajs/validator';

const validator = createValidator();
validator.field('name').required().string().length(3, 100);
validator.field('startTime').required().date('Invalid startTime format');
validator.field('endTime').required().date('Invalid endTime format');

export class ContestCreate {
  name: string;
  startTime: Date;
  endTime: Date;

  constructor(params: { name: string; startTime: Date; endTime: Date }) {
    this.name = params.name;
    this.startTime = params.startTime;
    this.endTime = params.endTime;

    const errors = validator.validate(this);
    if (errors.length > 0) {
      throw new HttpException('Validation failed', 400, errors);
    }
  }
}
