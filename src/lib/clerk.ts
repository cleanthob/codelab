import type { Roles } from "@/@types/clerk";

export const checkRole = (sessionClaims: unknown, role: Roles): boolean => {
  if (
    typeof sessionClaims !== "object" ||
    sessionClaims === null ||
    !("metadata" in sessionClaims)
  ) {
    return false;
  }

  const metadata = sessionClaims.metadata;

  if (
    typeof metadata !== "object" ||
    metadata === null ||
    !("role" in metadata)
  ) {
    return false;
  }

  return metadata.role === role;
};
