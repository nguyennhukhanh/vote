import { HttpException } from '@thanhhoajs/thanhhoa';
import axios from 'axios';
import { db } from 'src/database/db';
import { userSocials } from 'src/database/schemas/user-socials.schema';
import type { User } from 'src/database/schemas/users.schema';
import type { TokensType } from 'src/shared/types';

import type { UserService } from '../user/user.service';
import type { ValidateUserSocialDto } from './dto/user-social.validate';
import type { UserAuthService } from './user-auth.service';

export class GoogleAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userAuthService: UserAuthService,
  ) {}

  async login(
    dto: ValidateUserSocialDto,
  ): Promise<{ user: User; tokens: TokensType }> {
    const { id, email, firstName, lastName } = await this.getProfileByToken(
      dto.accessToken,
    );

    const fullName = `${firstName} ${lastName}`;

    let user = await this.userService.getUserByEmail(email);

    if (!user) {
      user = await this.userService.createUser({
        email,
        fullName,
      });

      await db
        .insert(userSocials)
        .values({ email, userId: user.id, socialId: id, fullName });
    }

    return await this.userAuthService.createUserSession(user);
  }

  private async getProfileByToken(accessToken: string) {
    try {
      const googleApi = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`;
      const { data } = await axios.get(googleApi);

      const { id, email, given_name: firstName, family_name: lastName } = data;

      return {
        id,
        email,
        firstName,
        lastName,
      };
    } catch (error) {
      if (error instanceof Error) throw new HttpException(error.message, 400);
      throw error;
    }
  }
}
