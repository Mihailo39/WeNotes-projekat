import { VALIDATION } from '../constants/limits';

/**
 * Validacija korisničkog imena
 */
export const validateUsername = (username: string): { isValid: boolean; message?: string } => {
  if (!username.trim()) {
    return { isValid: false, message: 'Korisničko ime je obavezno' };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: 'Korisničko ime mora imati najmanje 3 karaktera' };
  }
  
  if (username.length > VALIDATION.MAX_USERNAME_LENGTH) {
    return { isValid: false, message: `Korisničko ime ne sme biti duže od ${VALIDATION.MAX_USERNAME_LENGTH} karaktera` };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'Korisničko ime može sadržavati samo slova, brojeve i donje crte' };
  }
  
  return { isValid: true };
};

/**
 * Validacija lozinke
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Lozinka je obavezna' };
  }
  
  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return { isValid: false, message: `Lozinka mora imati najmanje ${VALIDATION.MIN_PASSWORD_LENGTH} karaktera` };
  }
  
  return { isValid: true };
};

/**
 * Validacija naslova beleške
 */
export const validateNoteTitle = (title: string): { isValid: boolean; message?: string } => {
  if (!title.trim()) {
    return { isValid: false, message: 'Naslov beleške je obavezan' };
  }
  
  if (title.length > VALIDATION.MAX_NOTE_TITLE_LENGTH) {
    return { isValid: false, message: `Naslov ne sme biti duži od ${VALIDATION.MAX_NOTE_TITLE_LENGTH} karaktera` };
  }
  
  return { isValid: true };
};

/**
 * Validacija sadržaja beleške
 */
export const validateNoteContent = (content: string): { isValid: boolean; message?: string } => {
  if (!content.trim()) {
    return { isValid: false, message: 'Sadržaj beleške je obavezan' };
  }
  
  if (content.length > VALIDATION.MAX_NOTE_CONTENT_LENGTH) {
    return { isValid: false, message: `Sadržaj ne sme biti duži od ${VALIDATION.MAX_NOTE_CONTENT_LENGTH} karaktera` };
  }
  
  return { isValid: true };
};

/**
 * Validacija email adrese
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email adresa je obavezna' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Unesite validnu email adresu' };
  }
  
  return { isValid: true };
};

/**
 * Validacija URL-a
 */
export const validateUrl = (url: string): { isValid: boolean; message?: string } => {
  if (!url.trim()) {
    return { isValid: true }; // URL je opcioni
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Unesite validan URL' };
  }
};
