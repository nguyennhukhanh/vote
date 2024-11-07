import { HttpException, type IRequestContext } from '@thanhhoajs/thanhhoa';

import type { AdminService } from '../admin/admin.service';
import type { SessionService } from '../session/session.service';
import type { CreateAdminDto } from './dto/admin.create';
import type { HashService } from './hash.service';
import type { JwtService } from './jwt.service';

export class AdminAuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  async register(
    context: IRequestContext,
    { fullName, email, password }: CreateAdminDto,
  ) {
    try {
      const hashedPassword = await this.hashService.hash(password);
      const admin = await this.adminService.createAdmin(context.admin, {
        fullName,
        email,
        password: hashedPassword,
      });

      const sessionExist = await this.sessionService.createAdminSession({
        adminId: admin.id,
      });

      const tokens = await this.jwtService.signAdminTokens({
        session: sessionExist.id,
      });

      return {
        admin,
        tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string) {
    const adminExist = await this.adminService.getAdminByEmail(email);

    if (!adminExist) {
      throw new HttpException('Admin not found', 404);
    }

    const passwordMatch = await this.hashService.compare(
      password,
      adminExist.password as string,
    );
    if (!passwordMatch) {
      throw new HttpException('Invalid password', 401);
    }

    const sessionExist = await this.sessionService.createAdminSession({
      adminId: adminExist.id,
    });

    const tokens = await this.jwtService.signAdminTokens({
      session: sessionExist.id,
    });

    return {
      admin: {
        ...adminExist,
        password: undefined,
      },
      tokens,
    };
  }

  async logout(context: IRequestContext): Promise<boolean> {
    try {
      const admin = context.admin;
      return await this.sessionService.deleteAdminSession({
        adminId: admin.id,
      });
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(context: IRequestContext) {
    try {
      const admin = context.admin;
      const sessionExist = await this.sessionService.createAdminSession({
        adminId: admin.id,
      });

      const tokens = await this.jwtService.signAdminTokens({
        session: sessionExist.id,
      });

      return {
        admin,
        tokens,
      };
    } catch (error) {
      throw error;
    }
  }
}
