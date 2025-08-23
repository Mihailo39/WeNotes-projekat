import { Role } from "../../enum/Role";

export class UserPublicDTO {
    constructor(
        public id: number = 0,
        public username: string = '',
        public role: Role = Role.User
    ) {}
}