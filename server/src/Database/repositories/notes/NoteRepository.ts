import { INoteRepository } from "../../../Domain/repositories/notes/INoteRepository";
import { Note } from "../../../Domain/models/Note";
import db from "../../connection/DbConnectionPool";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class NoteRepository implements INoteRepository {
    async create(note: Note): Promise<Note> {
            const query = 'INSERT INTO notes (user_id, title, content, image_url, is_pinned, is_shared, shared_token) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const [result] = await db.execute<ResultSetHeader>(query, [note.userId, note.title, note.content, note.imageUrl, note.isPinned, note.isShared, note.sharedToken]);

            return new Note(
                result.insertId, note.userId, note.title, note.content, note.imageUrl, note.isPinned, note.isShared, note.sharedToken
            );
        }

    async getById(id: number): Promise<Note | null> {
            const query = 'SELECT * FROM notes WHERE id = ?';
            const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

            if (!rows.length) {
                return null;
            }

            const row = rows[0] as RowDataPacket;
            return this.mapRowToNote(row);
    }

    async getByTitle(userId: number, title: string): Promise<Note | null> {
            const query = 'SELECT * FROM notes WHERE user_id = ? AND title = ?';
            const [rows] = await db.execute<RowDataPacket[]>(query, [userId, title]);

            if (!rows.length) {
                return null;
            }

            const row = rows[0] as RowDataPacket;
            return this.mapRowToNote(row);
    }

    async getAllByTitle(userId: number, title: string): Promise<Note[]> {
            const query = 'SELECT * FROM notes WHERE user_id = ? AND title = ? ORDER BY updated_at DESC';
            const [rows] = await db.execute<RowDataPacket[]>(query, [userId, title]);
            return rows.map(r => this.mapRowToNote(r));
    }
    
    async getAllByUserId(userId: number): Promise<Note[]> {
 
            const query = 'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC';
            const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);

            return rows.map(r => this.mapRowToNote(r))
    }

    async getShared(sharedToken: string): Promise<Note | null> {
            const query = 'SELECT * FROM notes WHERE shared_token = ? AND is_shared = TRUE';
            const [rows] = await db.execute<RowDataPacket[]>(query, [sharedToken]);

            if (!rows.length) {
                return null;
            }

            const row = rows[0] as RowDataPacket;
            return this.mapRowToNote(row);
    }


    async update(note: Note): Promise<Note | null> {
            const query = 'UPDATE notes SET title = ?, content = ?, image_url = ?, is_pinned = ?, is_shared = ?, shared_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            const [result] = await db.execute<ResultSetHeader>(query, [note.title, note.content, note.imageUrl, note.isPinned, note.isShared, note.sharedToken, note.id]);

            return result.affectedRows > 0 ? note : null;
    }
    
    async delete(id: number): Promise<boolean> {
            const query = 'DELETE FROM notes WHERE id = ?';
            const [result] = await db.execute<ResultSetHeader>(query, [id]);

            return result.affectedRows > 0;
    }

    async duplicate(noteId: number): Promise<Note | null> {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO notes (user_id, title, content, image_url, is_pinned, is_shared, shared_token)
       SELECT user_id, CONCAT(title, ' (Copy)'), content, image_url, is_pinned, 0, NULL
       FROM notes WHERE id = ?`,
      [noteId]
    );

    if (!result.insertId) return null;

    return this.getById(result.insertId);
    }

    private mapRowToNote(row: any): Note {
        return new Note(
            row.id,
            row.user_id,
            row.title,
            row.content,
            row.image_url,
            row.is_pinned,
            row.is_shared,
            row.shared_token && row.shared_token !== '0' ? row.shared_token : null,
            new Date(row.created_at ?? Date.now()),
            new Date(row.updated_at ?? Date.now())
        );
    }

}