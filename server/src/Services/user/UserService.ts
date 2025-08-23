import { IUserService } from "../../Domain/services/user/IUserService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { User } from "../../Domain/models/User";
import bcrypt from "bcryptjs";
import { UserUpdateInput } from "../../Domain/types/UserUpdateInput";
import { RefreshTokenRepository } from "../../Database/repositories/auth/RefreshTokenRepository";

export class UserService implements IUserService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  public async updateUser(input: UserUpdateInput): Promise<User | null> {
    const current = await this.userRepository.getById(input.id);
    if (!current) return null;

    if (input.username && input.username !== current.username) {
      const exists = await this.userRepository.getByUsername(input.username);
      if (exists) {
        // postoji vec username
        return null;
      }
    }

    const passwordHash =
      input.newPassword && input.newPassword.trim() !== ""
        ? await bcrypt.hash(input.newPassword, this.saltRounds)
        : current.password;

    // prevent self-upgrading role via public endpoint; keep existing role
    const toStore = new User(
      current.id,
      input.username || current.username,
      passwordHash,
      current.role
    );

    return await this.userRepository.update(toStore);
  }

  public async deleteSelf(userId: number, currentPassword: string): Promise<boolean> {
    const user = await this.userRepository.getById(userId);
    if (!user) return false;

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return false;

    // 1) Revoke all refresh tokens
    await this.refreshTokens.revokeAllForUser(userId);

    // 2) Delete user
    const deleted = await this.userRepository.delete(userId);
    return deleted;
  }
}
