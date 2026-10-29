import { getCourseProgress } from "@/actions/course-progress";
import { getCourse } from "@/actions/courses";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound, redirect } from "next/navigation";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;

  const { course } = await getCourse(slug);

  if (!course) return notFound();

  const { completedLessons } = await getCourseProgress(slug);

  const allLessons = course.modules.flatMap((mod) => mod.lessons);

  let lessonToRedirect = allLessons[0];

  const firstUncompletedLesson = allLessons.find((lesson) => {
    const completed = completedLessons.some(
      (completedLesson) => completedLesson.lessonId === lesson.id,
    );

    return !completed;
  });

  if (firstUncompletedLesson) {
    lessonToRedirect = firstUncompletedLesson;
  }

  if (lessonToRedirect) {
    redirect(
      `/courses/${slug}/${lessonToRedirect.moduleId}/lesson/${lessonToRedirect.id}`,
    );
  }

  return <Skeleton className="flex-1" />;
}
