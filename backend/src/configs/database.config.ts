import { createValidator } from '@thanhhoajs/validator';

const dbValidator = createValidator();

dbValidator.field('type').required().string();
dbValidator.field('host').required().string();
dbValidator.field('port').required().number();
dbValidator.field('username').required().string();
dbValidator.field('password').required().string();
dbValidator.field('database').required().string();
dbValidator.field('synchronize').required().boolean();
dbValidator.field('debug').required().boolean();

const dbConfig = {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  debug: process.env.DB_DEBUG === 'true',
};

export { dbConfig, dbValidator };
