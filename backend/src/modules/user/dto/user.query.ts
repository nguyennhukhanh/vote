import { CommonQuery } from 'src/shared/dto/common.query';

export class UserQuery extends CommonQuery {
  constructor(params: Partial<UserQuery> = {}) {
    super(params);
  }
}
