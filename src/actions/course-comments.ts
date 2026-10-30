"use server";

import { checkRole } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
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

export const deleteComment = async (commentId: string) => {
  const { sessionClaims } = await auth();
  const { userId } = await getUser();

  const isAdmin = checkRole(sessionClaims, "admin");

  const comment = await prisma.lessonComment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comentário não encontrado");
  }

  if (!isAdmin && comment.userId !== userId) {
    throw new Error("Você não tem permissão para deletar esse comentário");
  }

  await prisma.lessonComment.delete({
    where: { id: commentId },
  });
};
