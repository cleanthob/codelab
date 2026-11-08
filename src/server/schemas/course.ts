import { CourseDifficulty } from "@/generated/prisma/enums";
import z from "zod";

const courseLessonSchema = z.object({
  id: z.string(),
  title: z.string().nonempty("Campo obrigatório"),
  description: z.string().nonempty("Campo obrigatório"),
  videoId: z.string().nonempty("Campo obrigatório"),
  durationInMs: z.number().min(1, "Campo obrigatório"),
  order: z.number().min(1, "Campo obrigatório"),
});

const courseModuleSchema = z.object({
  id: z.string(),
  title: z.string().nonempty("Campo obrigatório"),
  description: z.string().nonempty("Campo obrigatório"),
  order: z.number().min(1, "Campo obrigatório"),
  lessons: z.array(courseLessonSchema).min(1, "Adicione pelo menos uma aula"),
});

export type CreateCourseModulePayload = z.infer<typeof courseModuleSchema>;

const courseSchema = z.object({
  title: z.string().nonempty("Campo obrigatório"),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(1, "Campo obrigatório"),
  discountPrice: z.coerce.number().optional(),
  description: z.string().nonempty("Campo obrigatório"),
  difficult: z.nativeEnum(CourseDifficulty, "Campo obrigatório"),
  tagsIds: z.array(z.string()).min(1, "Selecione pelo menos uma tag"),
  thumbnail: z.instanceof(File, { message: "Campo obrigatório" }),
});

export const createCourseSchema = courseSchema.extend({
  modules: z.array(courseModuleSchema).min(1, "Adicione pelo menos um módulo"),
});

export type CreateCourseFormData = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = courseSchema.extend({
  id: z.string(),
  thumbnail: z.instanceof(File).optional(),
});

export type UpdateCourseFormData = z.infer<typeof updateCourseSchema>;
