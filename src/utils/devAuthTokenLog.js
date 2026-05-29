/**
 * Dev-only: logs Bearer token to Metro console for API testing (search: API_AUTH_TOKEN).
 */
export function logAuthToken(source, payload) {
  if (!__DEV__) {
    return;
  }

  const token =
    payload?.accessToken ||
    payload?.data?.accessToken ||
    payload?.token ||
    payload?.data?.token ||
    (typeof payload === "string" ? payload : null);

  if (!token) {
    console.log(
      `[${source}] No access token in response yet (phone login issues token after OTP verify).`
    );
    return;
  }

  console.log(
    `\n========== API_AUTH_TOKEN [${source}] ==========\n${token}\n================================================\n`
  );
}
