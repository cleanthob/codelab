"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const getUser = async (throwError = true) => {
  const { userId } = await auth();

  const emptyUser = { user: null, clerkUserId: null, userId: null };

  if (!userId) {
    if (!throwError) return emptyUser;

    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    if (!throwError) return emptyUser;

    throw new Error("User not found");
  }

  return {
    user,
    clerkUserId: userId,
    userId: user.id,
  };
};
