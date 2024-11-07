import { createValidator } from '@thanhhoajs/validator';

const appValidator = createValidator();

appValidator.field('port').required().number();

const appConfig = {
  port: Number(process.env.PORT) || 3000,
};

export { appConfig, appValidator };
