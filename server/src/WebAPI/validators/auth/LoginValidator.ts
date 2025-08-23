import { ValidationResult } from "../../../Domain/types/ValidationResult";

export function loginValidationAuth(username?: string, password?: string): ValidationResult {
    if (!username || !password) {
        return { success: false, message: 'Username and password are required.' }
    }

    return { success : true };
}