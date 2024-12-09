import { CommonQuery } from 'src/shared/dto/common.query';

export class ContestChartQuery extends CommonQuery {
  constructor(params: Partial<ContestChartQuery> = {}) {
    super(params);
  }
}
