import { getDeviceType } from "@utils/uiUtils";

const isValidEmail = (email) =>
  typeof email === "string" &&
  email.includes("@") &&
  email !== "unknown";

export const buildSocialLoginPayload = ({
  provider,
  result,
  deviceId,
  fcmToken,
}) => {
  const userData = result?.userData || {};
  const base = {
    device_type: getDeviceType(),
    device_id: deviceId,
    fcm_token: fcmToken || "not_available",
  };

  if (provider === "apple") {
    const name =
      userData.name ||
      [userData.givenName, userData.familyName].filter(Boolean).join(" ").trim() ||
      undefined;

    return {
      ...base,
      ...(name ? { name } : {}),
      ...(isValidEmail(userData.email) ? { email: userData.email } : {}),
      social_id: userData.id,
      isIdentityToken: true,
      identityToken: userData.idToken,
    };
  }

  return {
    ...base,
    name: userData.givenName || userData.name,
    ...(isValidEmail(userData.email) ? { email: userData.email } : {}),
    social_id: userData.id,
  };
};

export default buildSocialLoginPayload;
