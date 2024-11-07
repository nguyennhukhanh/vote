import { HttpException } from '@thanhhoajs/thanhhoa';
import { eq } from 'drizzle-orm';
import { db } from 'src/database/db';
import { admins } from 'src/database/schemas/admins.schema';
import { RoleEnum } from 'src/shared/enums';

export class AdminService {
  async getAdminByEmail(email: string) {
    const result = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);
    return result[0];
  }

  async createAdmin(
    admin: { id: number },
    dto: {
      email: string;
      fullName: string;
      password: string;
    },
  ) {
    try {
      const { email, fullName, password } = dto;
      const adminExist = await this.getAdminByEmail(dto.email);
      if (adminExist) {
        throw new HttpException('Email already exist', 409);
      }

      const newAdmins = await db
        .insert(admins)
        .values({
          email,
          fullName,
          password,
          createdBy: admin.id,
        })
        .$returningId();
      return {
        id: newAdmins[0].id,
        email: dto.email,
        fullName: dto.fullName,
        role: RoleEnum.ADMIN,
      };
    } catch (error) {
      throw error;
    }
  }
}
