/**
 * Aplikacijske konstante i limiti
 */
export const LIMITS = {
  FREE_NOTES: 10,
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  MAX_IMAGE_DIMENSIONS: {
    WIDTH: 800,
    HEIGHT: 600
  }
} as const;

/**
 * UI konstante
 */
export const UI = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 3000
} as const;

/**
 * Validacijske konstante
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_USERNAME_LENGTH: 50,
  MAX_NOTE_TITLE_LENGTH: 100,
  MAX_NOTE_CONTENT_LENGTH: 10000
} as const;
