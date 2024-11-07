import { createValidator } from '@thanhhoajs/validator';

const redisValidator = createValidator();
redisValidator.field('host').required().string();
redisValidator.field('port').required().number();
redisValidator.field('name').required().string();
redisValidator.field('password').required().string();

const redisConfig = {
  host: process.env.REDIS_HOST as string,
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  name: process.env.REDIS_NAME,
};

export { redisConfig, redisValidator };
