import { User } from "../models/User";
import { UserPublicDTO } from "../DTOs/user/UserPublicDTO";
import { UserLoginDTO } from "../DTOs/auth/UserLoginDTO";

export function toUserPublicDTO(u: User): UserPublicDTO {
  return new UserPublicDTO(u.id, u.username, u.role);
}

export function toUserLoginDTO(u: User, accessToken: string): UserLoginDTO {
  return new UserLoginDTO(u.id, u.username, u.role, accessToken);
}
