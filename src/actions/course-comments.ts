"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./user";

type CreateLessonCommentPayload = {
  courseSlug: string;
  lessonId: string;
  content: string;
  parentId?: string;
};

export const getLessonComments = async (lessonId: string) => {
  await getUser();

  const comments = await prisma.lessonComment.findMany({
    where: { lessonId, parentId: null },
    include: { user: true, parent: true, replies: { include: { user: true } } },
    orderBy: { createdAt: "asc" },
  });

  return comments;
};

export const createLessonComment = async ({
  content,
  courseSlug,
  lessonId,
  parentId,
}: CreateLessonCommentPayload) => {
  const { userId } = await getUser();

  if (content.length > 500) {
    throw new Error("Comentário deve ter no máximo 500 caracteres");
  }

  const course = await prisma.course.findUnique({
    where: {
      slug: courseSlug,
    },
  });

  if (!course) {
    throw new Error("Curso não encontrado");
  }

  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new Error("Aula não encontrada");
  }

  const comment = await prisma.lessonComment.create({
    data: { content, lessonId, userId, parentId: parentId ?? null },
  });

  return comment;
};
