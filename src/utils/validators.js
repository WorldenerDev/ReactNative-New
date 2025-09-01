// utils/validation.js

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email";
  return null;
};

export const validateMobileNumber = (mobile) => {
  if (!mobile) return "Mobile number is required";
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobile))
    return "Please enter a valid 10-digit mobile number";
  return null;
};

export const validateOtp = (otp) => {
  if (!otp) return "OTP is required";
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) return "OTP must be exactly 6 digits";
  return null;
};

export const validateLetter = (value, text, minLength = 2) => {
  if (!value) return `${text} is required`;
  const letterOnlyRegex = /^[A-Za-z\s]+$/;
  if (!letterOnlyRegex.test(value))
    return `${text} can only contain letters and spaces`;
  if (value.trim().length < minLength)
    return `${text} must be at least ${minLength} characters long`;
  return null;
};

export const validateForm = (fields) => {
  for (let field of fields) {
    const error = field.validator(...field.values);
    if (error) return error;
  }
  return null;
};
