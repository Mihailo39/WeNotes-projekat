import { Role } from "../../enum/Role";

export class UserPublicDTO {
    constructor(
        public id: number = 0,
        public username: string = '',
        public role: Role = Role.User,
        public createdAt: string = new Date().toISOString(),
        public updatedAt: string = new Date().toISOString()
    ) {}
}