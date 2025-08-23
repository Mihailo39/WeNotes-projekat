import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../Domain/enum/Role';

// Tip koji odgovara JWT payloadu
interface JwtPayload {
  id: number;
  username: string;
  role: Role;
}

// Proširenje Express.Request da sadrži user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Middleware za autentikaciju preko JWT
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  // Provera da li postoji Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token missing' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token not found' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not defined!');
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};