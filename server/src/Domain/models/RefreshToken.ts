export interface RefreshToken {
  userId: number;
  token: string;
  expiresAt: Date;
  revokedAt?: Date | null;
}