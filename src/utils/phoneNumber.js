const COUNTRY_CODES = [
  "+61",
  "+41",
  "+91",
  "+44",
  "+86",
  "+81",
  "+49",
  "+33",
  "+39",
  "+34",
  "+55",
  "+52",
  "+82",
  "+31",
  "+1",
  "+7",
].sort((a, b) => b.length - a.length);

const PHONE_RULES = {
  "+61": {
    // Australia national mobile is commonly 9 digits (e.g. 4XX XXX XXX)
    min: 9,
    max: 9,
    stripLeadingZero: true,
  },
  "+41": {
    // Switzerland national number is 9 digits (e.g. 79 123 45 67)
    min: 9,
    max: 9,
    stripLeadingZero: true,
  },
  "+91": { min: 10, max: 10 },
  "+1": { min: 10, max: 10 },
  "+44": { min: 10, max: 11 },
  default: { min: 8, max: 15 },
};

export const digitsOnly = (value = "") => String(value).replace(/\D/g, "");

const getRule = (countryCode = "") =>
  PHONE_RULES[countryCode] || PHONE_RULES.default;

export const getNationalMaxLength = (countryCode = "") => {
  const rule = getRule(countryCode);
  return rule.stripLeadingZero ? rule.max + 1 : rule.max;
};

/**
 * Normalize a national number for API submission.
 * Strips spaces/dashes and a trunk leading 0 for AU/CH when present.
 */
export const normalizeNationalNumber = (mobile = "", countryCode = "") => {
  let digits = digitsOnly(mobile);
  const rule = getRule(countryCode);

  if (
    rule.stripLeadingZero &&
    digits.length === rule.max + 1 &&
    digits.startsWith("0")
  ) {
    digits = digits.slice(1);
  }

  return digits;
};

/**
 * Format national digits for input display.
 * Swiss: 00 000 00 00
 * Australia: 000 000 000
 */
export const formatNationalNumber = (mobile = "", countryCode = "") => {
  const maxLen = getNationalMaxLength(countryCode);
  const digits = digitsOnly(mobile).slice(0, maxLen);

  if (countryCode === "+41") {
    // +41 00 000 00 00
    const parts = [
      digits.slice(0, 2),
      digits.slice(2, 5),
      digits.slice(5, 7),
      digits.slice(7, 9),
    ].filter(Boolean);
    return parts.join(" ");
  }

  if (countryCode === "+61") {
    // +61 000 000 000
    const parts = [
      digits.slice(0, 3),
      digits.slice(3, 6),
      digits.slice(6, 9),
    ].filter(Boolean);
    return parts.join(" ");
  }

  return digits;
};

export const buildFullPhoneNumber = (countryCode = "", mobile = "") => {
  const national = normalizeNationalNumber(mobile, countryCode);
  return `${countryCode || ""}${national}`;
};

export const formatInternationalPhone = (fullPhone = "") => {
  if (!fullPhone) return "";

  const cleaned = digitsOnly(fullPhone);
  const matchedCode = COUNTRY_CODES.find((code) =>
    cleaned.startsWith(code.replace("+", "")),
  );

  if (!matchedCode) {
    return fullPhone.startsWith("+") ? fullPhone : `+${cleaned}`;
  }

  const dial = matchedCode.replace("+", "");
  const national = cleaned.slice(dial.length);
  const formattedNational = formatNationalNumber(national, matchedCode);

  return formattedNational
    ? `${matchedCode} ${formattedNational}`
    : matchedCode;
};

export const validateNationalMobile = (mobile, countryCode = "") => {
  if (!mobile || !digitsOnly(mobile)) {
    return "Mobile number is required";
  }

  const normalized = normalizeNationalNumber(mobile, countryCode);
  const rule = getRule(countryCode);

  if (normalized.length < rule.min || normalized.length > rule.max) {
    const lengthHint =
      rule.min === rule.max
        ? `${rule.min} digits`
        : `${rule.min}-${rule.max} digits`;
    return `Please enter a valid mobile number (${lengthHint})`;
  }

  // India mobiles start with 6-9
  if (countryCode === "+91" && !/^[6-9]/.test(normalized)) {
    return "Please enter a valid mobile number";
  }

  return null;
};
