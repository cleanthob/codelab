import type { Roles } from "@/@types/clerk";
import { auth } from "@clerk/nextjs/server";

export const checkRole = async (role: Roles): Promise<boolean> => {
  const { sessionClaims } = await auth();

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
