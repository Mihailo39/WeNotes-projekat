import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import { User } from "../../../Domain/models/User";
import db from "../../connection/DbConnectionPool";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Role } from "../../../Domain/enum/Role";

export class UserRepository implements IUserRepository {
    
    async create(user: User): Promise<User> {
            const query = 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)';
            const [result] = await db.execute<ResultSetHeader>(query, [user.username, user.password, user.role]);

            return new User(result.insertId, user.username, user.password, user.role);
    }

    async getById(id: number): Promise<User | null> {
            const query = 'SELECT id, username, password_hash AS password, role FROM users WHERE id = ?';
            const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

            if (!rows.length) {
                return null;
            }

            const row = rows[0] as RowDataPacket;
                return new User(
                    row.id as number,
                    row.username as string,
                    row.password as string,
                    this.mapRole(row.role)
                );
    }

    async getByUsername(username: string): Promise<User | null> {
            const query = 'SELECT id, username, password_hash AS password, role FROM users WHERE username = ?';
            const [rows] = await db.execute<RowDataPacket[]>(query, [username]);

            if (!rows.length) {
                return null;
            }

            const row = rows[0] as RowDataPacket;
                return new User(
                    row.id as number,
                    row.username as string,
                    row.password as string,
                    this.mapRole(row.role)
                );
    }

    async getAll(): Promise<User[]> {
            const query = 'SELECT id, username, password_hash AS password, role FROM users ORDER BY id ASC';
            const [rows] = await db.execute<RowDataPacket[]>(query);
            return rows.map(row => new User(row.id, row.username, row.password, this.mapRole(row.role)));
    }

    async update(user: User): Promise<User | null> {
            const query = 'UPDATE users SET username = ?, password_hash = ?, role = ? WHERE id = ?';
            const [result] = await db.execute<ResultSetHeader>(query, [user.username, user.password, user.role, user.id]);

            return result.affectedRows > 0 ? user : new User();
    }

    async delete(id: number): Promise<boolean> {
            const query = 'DELETE FROM users WHERE id = ?';
            const [result] = await db.execute<ResultSetHeader>(query, [id]);

            return result.affectedRows > 0;
    }

    async exists(id: number): Promise<boolean> {
            const query = 'SELECT COUNT(*) as count FROM users WHERE id = ?';
            const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

            const { count } = rows[0] as RowDataPacket & { count: number | string | bigint };
            return Number(count) > 0;
    }

    private mapRole(role: string): Role {
        return role === 'premium' ? Role.Premium : Role.User;
    }
}