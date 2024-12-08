import { CommonQuery } from 'src/shared/dto/common.query';

export class AdminQuery extends CommonQuery {
  constructor(params: Partial<AdminQuery> = {}) {
    super(params);
  }
}
