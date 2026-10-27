import { getCourse } from "@/actions/courses";
import { TopDetails } from "@/components/pages/courses/course-page/top-details";
import { notFound } from "next/navigation";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;

  const { course } = await getCourse(slug);

  if (!course) return notFound();

  return (
    <div className="w-full h-screen overflow-hidden grid grid-cols-[1fr_auto]">
      <div className="w-full h-full overflow-y-auto">
        <TopDetails course={course} />
      </div>
    </div>
  );
}
