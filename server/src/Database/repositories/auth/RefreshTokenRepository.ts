import db from "../../connection/DbConnectionPool";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { RefreshToken } from "../../../Domain/models/RefreshToken";
import { IRefreshTokenRepository } from "../../../Domain/repositories/auth/IRefreshTokenRepository";

function mapRowToRefreshToken(row: any): RefreshToken {
  return {
    userId: row.user_id,
    token: row.token,
    expiresAt: row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at),
    revokedAt: row.revoked_at ? (row.revoked_at instanceof Date ? row.revoked_at : new Date(row.revoked_at)) : null,
  };
}

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async save(userId: number, token: string, expiresAt: Date): Promise<void> {
    await db.execute<ResultSetHeader>(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [userId, token, expiresAt]
    );
  }

  async findActive(token: string): Promise<RefreshToken | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT user_id, token, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token = ? AND revoked_at IS NULL`,
      [token]
    );
    const result = (rows as any[])[0];
    return result ? mapRowToRefreshToken(result) : null;
  }

  async revoke(token: string): Promise<void> {
    await db.execute<ResultSetHeader>(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ?`,
      [token]
    );
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await db.execute<ResultSetHeader>(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE user_id = ? AND revoked_at IS NULL`,
      [userId]
    );
  }
}
