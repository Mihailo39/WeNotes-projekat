import { User } from "../../models/User";
import { UserUpdateInput } from "../../types/UserUpdateInput";

export interface IUserService {
  updateUser(input: UserUpdateInput): Promise<User | null>;
  deleteSelf(userId: number, currentPassword: string): Promise<boolean>;
}
