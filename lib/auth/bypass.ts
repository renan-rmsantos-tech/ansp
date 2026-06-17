export const BYPASS_EMAIL = "admin@admin.com";
export const BYPASS_PASSWORD = "admin123";

export const BYPASS_USER = {
  id: "00000000-0000-0000-0000-000000000000",
  email: BYPASS_EMAIL,
};

/** Fixed credentials for demo/staging when AUTH_BYPASS=true. */
export function isAuthBypass() {
  return process.env.AUTH_BYPASS === "true";
}
