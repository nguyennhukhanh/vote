import { HashService } from '../auth/hash.service';
import { JwtService } from '../auth/jwt.service';
import { UserAuthService } from '../auth/user-auth.service';
import { SessionService } from '../session/session.service';
import { UserService } from '../user/user.service';
import { RedisService } from './redis.service';

// Singleton instances
const hashServiceInstance = new HashService();
const sessionServiceInstance = new SessionService();
const jwtServiceInstance = new JwtService(sessionServiceInstance);
const redisServiceInstance = new RedisService();
const userServiceInstance = new UserService();
const userAuthServiceInstance = new UserAuthService(
  jwtServiceInstance,
  sessionServiceInstance,
);

export const hashService = hashServiceInstance;
export const sessionService = sessionServiceInstance;
export const jwtService = jwtServiceInstance;
export const redisService = redisServiceInstance;
export const userService = userServiceInstance;
export const userAuthService = userAuthServiceInstance;
