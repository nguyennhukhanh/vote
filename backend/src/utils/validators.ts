import { createValidator } from '@thanhhoajs/validator';
import { SortEnum } from 'src/shared/enums';

export const createCommonValidator = () => {
  const validator = createValidator();
  validator.field('search').optional().string();
  validator.field('fromDate').optional().date('Invalid fromDate format');
  validator.field('toDate').optional().date('Invalid toDate format');
  validator
    .field('sort')
    .optional()
    .enum([SortEnum.ASC, SortEnum.DESC], 'Sort must be ASC or DESC');
  validator.field('page').optional().number().min(1);
  validator
    .field('limit')
    .optional()
    .number()
    .custom(
      (value) => value > 0 && value <= 100,
      'Limit must be between 1 and 100',
    );
  return validator;
};
