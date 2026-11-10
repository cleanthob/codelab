"use server";

import { prisma } from "@/lib/prisma";
import { formatName } from "@/lib/utils";

export const getRanking = async (): Promise<RankingUser[]> => {
  const ranking = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      _count: {
        select: {
          completedLessons: true,
        },
      },
    },
    orderBy: {
      completedLessons: {
        _count: "desc",
      },
    },
    take: 10,
  });

  return ranking.map((user, index) => ({
    position: index + 1,
    id: user.id,
    name: formatName(user.firstName, user.lastName),
    imageUrl: user.imageUrl,
    completedLessons: user._count.completedLessons,
  }));
};
