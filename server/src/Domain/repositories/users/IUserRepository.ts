import { User } from "../../models/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  getById(id: number): Promise<User | null>;
  getByUsername(username: string): Promise<User | null>;
  getAll(): Promise<User[]>;
  update(user: User): Promise<User | null>;
  delete(id: number): Promise<boolean>;
  exists(id: number): Promise<boolean>;
}