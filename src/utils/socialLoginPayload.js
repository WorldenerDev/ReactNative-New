import { getDeviceType } from "@utils/uiUtils";

const isValidEmail = (email) =>
  typeof email === "string" &&
  email.includes("@") &&
  email !== "unknown";

/** Resolve a display name from social SDK userData (Apple / Google). */
export const extractSocialDisplayName = (userData = {}) => {
  const fromParts = [userData.givenName, userData.familyName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const candidate =
    (typeof userData.name === "string" && userData.name.trim()) ||
    fromParts ||
    (typeof userData.givenName === "string" && userData.givenName.trim()) ||
    "";
  return candidate || undefined;
};

export const hasUsableName = (name) =>
  typeof name === "string" && name.trim().length > 0;

export const buildSocialLoginPayload = ({
  provider,
  result,
  deviceId,
  fcmToken,
  nameOverride,
}) => {
  const userData = result?.userData || {};
  const base = {
    device_type: getDeviceType(),
    device_id: deviceId,
    fcm_token: fcmToken || "not_available",
  };

  const resolvedName = hasUsableName(nameOverride)
    ? nameOverride.trim()
    : extractSocialDisplayName(userData);

  if (provider === "apple") {
    return {
      ...base,
      ...(resolvedName ? { name: resolvedName } : {}),
      ...(isValidEmail(userData.email) ? { email: userData.email } : {}),
      social_id: userData.id,
      isIdentityToken: true,
      identityToken: userData.idToken,
    };
  }

  return {
    ...base,
    ...(resolvedName ? { name: resolvedName } : {}),
    ...(isValidEmail(userData.email) ? { email: userData.email } : {}),
    social_id: userData.id,
  };
};

export const isSocialLoginPayloadValid = (payload) =>
  Boolean(payload?.social_id);

export default buildSocialLoginPayload;
