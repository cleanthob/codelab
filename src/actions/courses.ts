"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./user";
import { checkRole } from "@/lib/clerk";

type GetCoursesPayload = {
  query?: string;
  tags?: string[] | string;
};

export const getCourses = async ({
  query,
  tags: rawTags,
}: GetCoursesPayload) => {
  const tags = !rawTags ? [] : Array.isArray(rawTags) ? rawTags : [rawTags];

  const hasTags = !!tags.length;
  const hasQuery = !!query?.trim();

  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      tags: hasTags
        ? {
            some: {
              id: {
                in: tags,
              },
            },
          }
        : undefined,
      OR: hasQuery
        ? [{ title: { search: query } }, { description: { search: query } }]
        : undefined,
    },
    include: {
      tags: true,
      modules: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return courses;
};

export const getCourse = async (
  query: string,
  queryType: "slug" | "id" = "slug",
) => {
  const course = await prisma.course.findUnique({
    where: queryType === "slug" ? { slug: query } : { id: query },
    include: {
      modules: {
        include: {
          lessons: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
      tags: true,
    },
  });

  return { course };
};

export const getPurchasedCourses = async (detailed = false) => {
  const { userId } = await getUser(false);

  if (!userId) return [];

  const purchasedCourses = await prisma.coursePurchase.findMany({
    where: { userId },
    include: {
      course: detailed
        ? {
            include: {
              tags: true,
              modules: true,
            },
          }
        : true,
    },
  });

  return purchasedCourses.map((purchase) => purchase.course);
};

export const getPurchasedCoursesWithDetails = async () => {
  const purchasedCourses = await getPurchasedCourses(true);

  return purchasedCourses as CourseWithTagsAndModules[];
};

export const getAdminCourses = async () => {
  const isAdmin = await checkRole("admin");

  if (!isAdmin) throw new Error("Unauthorized");

  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tags: true,
      modules: true,
    },
  });

  return courses;
};
