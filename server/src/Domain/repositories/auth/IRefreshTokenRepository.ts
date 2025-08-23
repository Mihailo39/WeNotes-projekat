import { RefreshToken } from "../../models/RefreshToken";

export interface IRefreshTokenRepository {
  save(userId: number, token: string, expiresAt: Date): Promise<void>;
  findActive(token: string): Promise<RefreshToken | null>;
  revoke(token: string): Promise<void>;
  revokeAllForUser(userId: number): Promise<void>;
}
