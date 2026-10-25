import { PrismaClient } from "@/generated/prisma/client";
import sampleCourses from "./sample-courses.json";

import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const courseData of sampleCourses) {
    const { tags, modules, ...courses } = courseData;

    const createdCourse = await prisma.course.create({
      data: {
        ...courses,
        status: "PUBLISHED",

        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },

        modules: {
          create: modules.map((courseModule, index) => ({
            title: courseModule.title,
            description: courseModule.description,
            order: index + 1,

            lessons: {
              create: courseModule.lessons.map((lesson, lessonIndex) => ({
                title: lesson.title,
                description: lesson.description,
                videoId: lesson.videoId,
                durationInMs: lesson.durationInMs,
                order: lessonIndex + 1,
              })),
            },
          })),
        },
      },
    });

    console.log("Curso criado:", createdCourse.title);
  }
}

main()
  .catch((error) => {
    console.error("Erro ao criar cursos:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
