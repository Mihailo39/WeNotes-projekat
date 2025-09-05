import { User } from "../models/User";
import { UserPublicDTO } from "../DTOs/user/UserPublicDTO";
import { UserLoginDTO } from "../DTOs/auth/UserLoginDTO";

export function toUserPublicDTO(u: User): UserPublicDTO {
  return new UserPublicDTO(u.id, u.username, u.role, u.createdAt, u.updatedAt);
}

export function toUserLoginDTO(u: User, accessToken: string): UserLoginDTO {
  return new UserLoginDTO(
    u.id,
    u.username,
    u.role,
    accessToken,
    u.createdAt,
    u.updatedAt
  );
}
