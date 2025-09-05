import { ValidationResult } from "../../../Domain/types/ValidationResult";
import { Role } from "../../../Domain/enum/Role";

export function dataValidationAuth(username?: string, password?: string, role?: Role): ValidationResult {
    if (!username || !password || !role) {
        return { success: false, message: 'Username, password and role are required.' }
    }

    if (username.length < 3) {
        return { success: false, message: 'Username should contain at least 3 characters' }
    }

    if (password.length < 6) {
        return { success: false, message: 'Password should contain at least 6 characters' }
    }

    if (password.length > 30) {
        return { success: false, message: 'Password should not contain more than 30 characters' }
    }

    if (role !== Role.User && role !== Role.Premium) {
    return { success: false, message: 'Role must be either "user" or "premium".' };
    }

    return { success : true };
}