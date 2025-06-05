// utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
  strength: number;
} => {
  const errors: string[] = [];
  let strength = 0;

  if (password.length < 8) {
    errors.push("passwordTooShort");
  } else {
    strength++;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("passwordNeedUppercase");
  } else {
    strength++;
  }

  if (!/[a-z]/.test(password)) {
    errors.push("passwordNeedLowercase");
  } else {
    strength++;
  }

  if (!/[0-9]/.test(password)) {
    errors.push("passwordNeedNumber");
  } else {
    strength++;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("passwordNeedSpecial");
  } else {
    strength++;
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

export const validateNickname = (
  nickname: string
): {
  isValid: boolean;
  error?: string;
} => {
  const trimmed = nickname.trim();

  if (!trimmed) {
    return { isValid: false, error: "nicknameRequired" };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: "nicknameTooShort" };
  }

  if (trimmed.length > 20) {
    return { isValid: false, error: "nicknameTooLong" };
  }

  // 허용된 문자만 체크 (한글, 영문, 숫자, 언더스코어, 하이픈)
  if (!/^[a-zA-Z0-9가-힣_-]+$/.test(trimmed)) {
    return { isValid: false, error: "nicknameInvalidChars" };
  }

  return { isValid: true };
};
