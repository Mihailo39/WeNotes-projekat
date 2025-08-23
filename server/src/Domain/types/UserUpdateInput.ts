import { Role } from "../enum/Role";

export type UserUpdateInput = {
  id: number;
  username?: string;
  role?: Role;
  newPassword?: string;
};