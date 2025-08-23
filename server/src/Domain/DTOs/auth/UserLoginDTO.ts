import { Role } from "../../enum/Role";

export class UserLoginDTO {
    constructor(
        public id: number = 0,
        public username: string = '',
        public role: Role = Role.User,
        public token: string = ''
    ) {}
}