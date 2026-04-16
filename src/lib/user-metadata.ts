export type AppUserRole = "resident" | "admin";

export type AppPublicMetadata = {
  flatNumber?: string;
  role?: AppUserRole;
};

export function getFlatNumber(
  metadata: AppPublicMetadata | null | undefined,
) {
  return typeof metadata?.flatNumber === "string" ? metadata.flatNumber : "";
}

export function getRole(
  metadata: AppPublicMetadata | null | undefined,
): AppUserRole {
  return metadata?.role === "admin" ? "admin" : "resident";
}

export function isAdminEmail(emailAddress: string | undefined) {
  if (!emailAddress) {
    return false;
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(emailAddress.toLowerCase());
}
