import { HttpException } from '@thanhhoajs/thanhhoa';
import { createValidator } from '@thanhhoajs/validator';
import { CommonQuery } from 'src/shared/dto/common.query';

const postValidator = createValidator();
postValidator.field('voteId').optional().number().min(1);
postValidator.field('candidateId').optional().number().min(1);

export class VoteQuery extends CommonQuery {
  voteId?: number;
  candidateId?: number;
  constructor(params: Partial<VoteQuery> = {}) {
    super(params);

    this.voteId = params.voteId ? Number(params.voteId) : undefined;
    this.candidateId = params.candidateId
      ? Number(params.candidateId)
      : undefined;

    const errors = postValidator.validate(this);
    if (errors.length)
      throw new HttpException('Validation failed', 400, errors);
  }
}
