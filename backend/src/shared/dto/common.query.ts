import { HttpException } from '@thanhhoajs/thanhhoa';
import { createCommonValidator } from 'src/utils/validators';

import type { SortEnum } from '../enums';

const commonValidator = createCommonValidator();

export class CommonQuery {
  search?: string;
  fromDate?: Date;
  toDate?: Date;
  sort?: SortEnum;
  page: number;
  limit: number;

  constructor(params: Partial<CommonQuery> = {}) {
    this.page = params.page ? Number(params.page) : 1;
    this.limit = params.limit ? Number(params.limit) : 10;
    this.search = params.search;
    this.fromDate = params.fromDate ? new Date(params.fromDate) : undefined;
    this.toDate = params.toDate ? new Date(params.toDate) : undefined;
    this.sort = params.sort as SortEnum;

    const errors = commonValidator.validate(this);
    if (errors.length)
      throw new HttpException('Validation failed', 400, errors);
  }
}
