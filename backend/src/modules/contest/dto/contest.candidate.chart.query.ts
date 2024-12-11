import { HttpException } from '@thanhhoajs/thanhhoa';
import { createValidator } from '@thanhhoajs/validator';
import { CommonQuery } from 'src/shared/dto/common.query';

const validator = createValidator();
validator.field('contestId').required().number();

export class ContestCandidateChartQuery extends CommonQuery {
  contestId!: number;

  constructor(params: Partial<ContestCandidateChartQuery>) {
    super(params);
    Object.assign(this, params);
    this.validate();
  }

  validate() {
    const errors = validator.validate(this);
    if (errors.length > 0) {
      throw new HttpException('Validation failed', 400, errors);
    }
  }
}
