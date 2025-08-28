// utils/validation.js

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email";
    return null;
};

export const validatePassword = (password) => {
    if (!password) return "Password is required";
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!regex.test(password))
        return "Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 special character";
    return null;
};

export const validatePasswordAndConfirm = (password, confirmPassword) => {
    if (!password) return "Password is required";
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password))
        return "Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 special character";
    if (!confirmPassword) return "Confirm password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
};

export const validateOtp = (otp) => {
    if (!otp) return "OTP is required";
    const otpRegex = /^\d{4}$/;
    if (!otpRegex.test(otp)) return "OTP must be exactly 4 digits";
    return null;
};

export const validateLetter = (value, text, minLength = 2) => {
    if (!value) return `${text} is required`;
    const letterOnlyRegex = /^[A-Za-z\s]+$/;
    if (!letterOnlyRegex.test(value)) return `${text} can only contain letters and spaces`;
    if (value.trim().length < minLength) return `${text} must be at least ${minLength} characters long`;
    return null;
};

// fields = [{ values: [email], validator: validateEmail }]
export const validateForm = (fields) => {
    for (let field of fields) {
        const error = field.validator(...field.values);
        if (error) return error;
    }
    return null;
};

