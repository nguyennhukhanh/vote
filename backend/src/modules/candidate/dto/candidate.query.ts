import { CommonQuery } from 'src/shared/dto/common.query';

export class CandidateQuery extends CommonQuery {
  constructor(params: Partial<CandidateQuery> = {}) {
    super(params);
  }
}
