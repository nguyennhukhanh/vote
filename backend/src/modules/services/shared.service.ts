import { AdminService } from '../admin/admin.service';
import { HashService } from '../auth/hash.service';
import { JwtService } from '../auth/jwt.service';
import { UserAuthService } from '../auth/user-auth.service';
import { GeminiService } from '../bot/gemini.service';
import { SessionService } from '../session/session.service';
import { UserService } from '../user/user.service';
import { VoteService } from '../vote/vote.service';
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
const adminServiceInstance = new AdminService();
const geminiServiceInstance = new GeminiService();
const voteServiceInstance = new VoteService();

export const hashService = hashServiceInstance;
export const sessionService = sessionServiceInstance;
export const jwtService = jwtServiceInstance;
export const redisService = redisServiceInstance;
export const userService = userServiceInstance;
export const userAuthService = userAuthServiceInstance;
export const adminService = adminServiceInstance;
export const geminiService = geminiServiceInstance;
export const voteService = voteServiceInstance;
