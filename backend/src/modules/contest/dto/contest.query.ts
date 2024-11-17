import { CommonQuery } from 'src/shared/dto/common.query';

export class ContestQuery extends CommonQuery {
  constructor(params: Partial<ContestQuery> = {}) {
    super(params);
  }
}
