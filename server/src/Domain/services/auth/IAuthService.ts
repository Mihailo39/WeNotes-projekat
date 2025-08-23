import { UserLoginDTO } from "../../DTOs/auth/UserLoginDTO";
import { Role } from "../../enum/Role";
import { User } from "../../models/User";

export type AuthResult = {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface IAuthService {
    login(username: string, password: string): Promise<AuthResult | null>;
    register(username: string, password: string, role: Role): Promise<AuthResult | null>;
    refresh(oldRefreshToken: string): Promise<AuthResult | null>;
    logoutAll(userId: number): Promise<void>;
}