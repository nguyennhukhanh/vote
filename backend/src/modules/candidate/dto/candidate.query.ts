import { HttpException } from '@thanhhoajs/thanhhoa';
import { createValidator } from '@thanhhoajs/validator';
import { CommonQuery } from 'src/shared/dto/common.query';

const postValidator = createValidator();
postValidator.field('voteId').optional().number().min(1);

export class CandidateQuery extends CommonQuery {
  voteId?: number;

  constructor(params: Partial<CandidateQuery> = {}) {
    super(params);

    this.voteId = params.voteId ? Number(params.voteId) : undefined;

    const errors = postValidator.validate(this);
    if (errors.length)
      throw new HttpException('Validation failed', 400, errors);
  }
}
