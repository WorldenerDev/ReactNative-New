// utils/validation.js

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email";
  return null;
};

export const validateMobileNumber = (mobile) => {
  if (!mobile) return "Mobile number is required";
  const mobileRegex = /^[6-9]\d{7,10}$/;
  if (!mobileRegex.test(mobile))
    return "Please enter a valid mobile number (8-11 digits)";
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

// Trip validation functions
export const validateCity = (cityName) => {
  if (!cityName || cityName.trim() === "") {
    return "Please select a city";
  }
  return null;
};

export const validateFromDate = (date) => {
  if (!date) {
    return "Please select a start date";
  }

  const today = new Date();
  const selectedDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return "Start date cannot be in the past";
  }
  return null;
};

export const validateToDate = (date, fromDateValue) => {
  if (!date) {
    return "Please select an end date";
  }

  if (fromDateValue && date < fromDateValue) {
    return "End date must be after start date";
  }

  const today = new Date();
  const selectedDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return "End date cannot be in the past";
  }
  return null;
};

export const validateTripMembers = (selectedMembers) => {
  if (!selectedMembers || selectedMembers.length === 0) {
    return "Please add at least one member to the trip";
  }
  return null;
};

export const validateForm = (fields) => {
  for (let field of fields) {
    const error = field.validator(...field.values);
    if (error) return error;
  }
  return null;
};
