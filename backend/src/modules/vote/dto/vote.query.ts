import { CommonQuery } from 'src/shared/dto/common.query';

export class VoteQuery extends CommonQuery {
  constructor(params: Partial<VoteQuery> = {}) {
    super(params);
  }
}
