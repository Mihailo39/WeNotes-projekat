import jwt from 'jsonwebtoken';
import { User } from '../Domain/models/User';

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn:'15m' }
  );
}