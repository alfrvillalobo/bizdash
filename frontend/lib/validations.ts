export interface ValidationResult {
  valid: boolean;
  message: string;
}

export const validateName = (name: string): ValidationResult => {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, message: "El nombre es requerido" };
  if (trimmed.length < 2) return { valid: false, message: "El nombre debe tener al menos 2 caracteres" };
  if (trimmed.length > 100) return { valid: false, message: "El nombre es demasiado largo" };
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmed)) {
    return { valid: false, message: "El nombre solo puede contener letras y espacios" };
  }
  return { valid: true, message: "" };
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email) return { valid: false, message: "El email es requerido" };
  if (!email.endsWith("@bizdash.com")) {
    return { valid: false, message: "El correo debe ser del dominio @bizdash.com" };
  }
  // Validar que haya algo antes del @
  const local = email.split("@")[0];
  if (!local || local.length < 2) {
    return { valid: false, message: "El correo no es válido" };
  }
  return { valid: true, message: "" };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) return { valid: false, message: "La contraseña es requerida" };
  if (password.length < 6) {
    return { valid: false, message: "La contraseña debe tener al menos 6 caracteres" };
  }
  return { valid: true, message: "" };
};

// Valida todos los campos del formulario de creación
export const validateCreateForm = (form: {
  name: string;
  email: string;
  password: string;
}): string => {
  const nameResult     = validateName(form.name);
  const emailResult    = validateEmail(form.email);
  const passwordResult = validatePassword(form.password);

  if (!nameResult.valid)     return nameResult.message;
  if (!emailResult.valid)    return emailResult.message;
  if (!passwordResult.valid) return passwordResult.message;
  return "";
};