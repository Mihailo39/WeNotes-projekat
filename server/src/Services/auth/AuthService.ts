import bcrypt from 'bcryptjs';
import { User } from '../../Domain/models/User';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { AuthResult, IAuthService } from '../../Domain/services/auth/IAuthService';
import { generateToken } from '../../utils/token';
import { Role } from '../../Domain/enum/Role';
import { IRefreshTokenRepository } from '../../Domain/repositories/auth/IRefreshTokenRepository';
import { RefreshTokenRepository } from '../../Database/repositories/auth/RefreshTokenRepository';
import { calcRefreshExpiry, generateRefreshToken } from '../../utils/refresh';

export class AuthService implements IAuthService {
    private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly refreshTokenRepository: IRefreshTokenRepository = new RefreshTokenRepository()
    ) {}

    private buildAuthResult(user: User, refreshToken: string): AuthResult {
        const accessToken = generateToken(user); //JWT
        return { user, accessToken, refreshToken };
    }

    async login(username: string, password: string): Promise<AuthResult | null> {

        const user = await this.userRepository.getByUsername(username);

        if (!user) {
            return null;
        }

        const success = await bcrypt.compare(password, user.password);
        if (!success) {
            return null;
        }

        const refreshToken = generateRefreshToken();
        await this.refreshTokenRepository.save(user.id, refreshToken, calcRefreshExpiry());

        return this.buildAuthResult(user, refreshToken);
    }

    async register(username: string, password: string, role: Role): Promise<AuthResult | null> {
    const existing = await this.userRepository.getByUsername(username);
    if (existing) {
        return null; // korisnik već postoji
    }

    const hash = await bcrypt.hash(password, this.saltRounds);
    const created = await this.userRepository.create(new User(0, username, hash, role));

    if (!created || !created.id || created.id <= 0) {
        return null; // kreiranje nije uspelo
    }

    const refreshToken = generateRefreshToken();
    await this.refreshTokenRepository.save(created.id, refreshToken, calcRefreshExpiry());

    return this.buildAuthResult(created, refreshToken);
}

    async refresh(oldRefreshToken: string): Promise<AuthResult | null> {
        const recent = await this.refreshTokenRepository.findActive(oldRefreshToken);
        if (!recent) {
            return null;
        }

        if (new Date(recent.expiresAt) <= new Date()) {
            await this.refreshTokenRepository.revoke(oldRefreshToken);
            return null;
        }

        await this.refreshTokenRepository.revoke(oldRefreshToken);

        const user = await this.userRepository.getById(recent.userId);
        if (!user) {
            return null;
        }

        const newRefreshToken = generateRefreshToken();
        await this.refreshTokenRepository.save(user.id, newRefreshToken, calcRefreshExpiry());

        return this.buildAuthResult(user, newRefreshToken);
    }

    async logoutAll(userId: number): Promise<void> {
        await this.refreshTokenRepository.revokeAllForUser(userId);
    }
}