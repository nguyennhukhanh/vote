import { createValidator } from '@thanhhoajs/validator';

const adminAuthValidator = createValidator();

adminAuthValidator.field('accessTokenSecret').required().string();
adminAuthValidator.field('accessTokenLifetime').required().number();
adminAuthValidator.field('refreshTokenSecret').required().string();
adminAuthValidator.field('refreshTokenLifetime').required().number();

const adminAuthConfig = {
  accessTokenSecret: process.env.ADMIN_ACCESS_TOKEN_SECRET,
  accessTokenLifetime: Number(process.env.ADMIN_ACCESS_TOKEN_LIFETIME),
  refreshTokenSecret: process.env.ADMIN_REFRESH_TOKEN_SECRET,
  refreshTokenLifetime: Number(process.env.ADMIN_REFRESH_TOKEN_LIFETIME),
};

export { adminAuthConfig, adminAuthValidator };
