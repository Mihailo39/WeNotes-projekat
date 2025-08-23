import { ValidationResult } from "../../../Domain/types/ValidationResult";
import { Role } from "../../../Domain/enum/Role";

export function dataValidationNoteCreate(
  title?: string,
  content?: string,
  imageUrl?: string | null,
  role?: Role
): ValidationResult {
  if (!title || !content) {
    return { success: false, message: "Title and content are required." };
  }

  if (title.length > 100) {
    return { success: false, message: "Title must not exceed 100 characters." };
  }

  if (role === Role.User && imageUrl) {
    return { success: false, message: "Regular users cannot add images." };
  }

  if (imageUrl && typeof imageUrl === "string") {
    try {
      new URL(imageUrl);
    } catch {
      return { success: false, message: "Image URL is not valid." };
    }
  }

  return { success: true };
}

export function dataValidationNoteUpdate(
  title?: string,
  content?: string,
  imageUrl?: string | null,
  role?: Role
): ValidationResult {
  if (title && title.length > 100) {
    return { success: false, message: "Title must not exceed 100 characters." };
  }

  if (content && content.length < 1) {
    return { success: false, message: "Content must not be empty." };
  }

  if (role === Role.User && imageUrl) {
    return { success: false, message: "Regular users cannot add images." };
  }

  if (imageUrl && typeof imageUrl === "string") {
    try {
      new URL(imageUrl);
    } catch {
      return { success: false, message: "Image URL is not valid." };
    }
  }

  return { success: true };
}

