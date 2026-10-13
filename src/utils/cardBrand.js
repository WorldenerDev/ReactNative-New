const BRAND_LABELS = {
  visa: "VISA",
  mastercard: "MASTERCARD",
  master: "MASTERCARD",
  amex: "AMEX",
  americanexpress: "AMEX",
  discover: "DISCOVER",
  jcb: "JCB",
  diners: "DINERS",
  dinersclub: "DINERS",
  unionpay: "UNIONPAY",
  cartesbancaires: "CARTES BANCAIRES",
  unknown: "CARD",
  card: "CARD",
};

const BRAND_KEYS = [
  ["americanexpress", "amex"],
  ["amex", "amex"],
  ["mastercard", "mastercard"],
  ["master", "mastercard"],
  ["visa", "visa"],
  ["discover", "discover"],
  ["dinersclub", "diners"],
  ["diners", "diners"],
  ["unionpay", "unionpay"],
  ["jcb", "jcb"],
  ["cartesbancaires", "unknown"],
];

const normalizeKey = (brand) =>
  String(brand || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

export function formatCardBrand(brand) {
  const key = normalizeKey(brand);
  if (!key) {
    return "CARD";
  }
  return BRAND_LABELS[key] || String(brand).trim().toUpperCase();
}

export function getCardBrandKey(brand) {
  const key = normalizeKey(brand);
  const match = BRAND_KEYS.find(([alias]) => key.includes(alias));
  return match?.[1] || "unknown";
}
