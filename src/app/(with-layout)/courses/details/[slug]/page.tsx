import { getCourse } from "@/actions/courses";
import { CourseProgress } from "@/components/pages/courses/course-details/course-progress";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatDifficulty, formatDuration } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar,
  Camera,
  ChartColumnIncreasing,
  CirclePlay,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

type CourseDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export default async function CourseDetailPage({
  params,
}: CourseDetailsPageProps) {
  const { slug } = await params;
  const { course } = await getCourse(slug);

  if (!course) return notFound();

  const totalLessons = course.modules.reduce((acc, mod) => {
    return acc + mod.lessons.length;
  }, 0);

  const totalDuration = course.modules.reduce((total, mod) => {
    const moduleDuration = mod.lessons.reduce(
      (sum, lesson) => sum + lesson.durationInMs,
      0,
    );

    return total + moduleDuration;
  }, 0);

  const details = [
    { icon: Clock, label: "Duração", value: formatDuration(totalDuration) },
    {
      icon: Camera,
      label: "Aulas",
      value: `${totalLessons} aulas`,
    },
    {
      icon: ChartColumnIncreasing,
      label: "Dificuldade",
      value: formatDifficulty(course.difficulty),
    },
    {
      icon: Calendar,
      label: "Data de publicação",
      value: format(course.createdAt, "dd/MM/yyyy"),
    },
  ];

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        {/* Informações do curso */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="mb-4">
            <BackButton />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold">{course.title}</h1>

          {course.shortDescription && (
            <p className="text-muted-foreground mt-3">
              {course.shortDescription}
            </p>
          )}

          <div className="flex items-center flex-wrap gap-2.5 mt-5">
            {course.tags.map((tag) => (
              <Badge key={tag.id}>{tag.name}</Badge>
            ))}
          </div>
        </div>

        {/* Imagem do curso */}
        <div className="w-full md:w-[300px] shrink-0">
          <Image
            src={course.thumbnail}
            alt={course.title}
            width={600}
            height={338}
            className="aspect-video rounded-2xl border border-primary object-cover w-full h-auto"
            priority
          />
        </div>
      </div>
      <Separator className="my-6" />
      <div className="w-full grid md:grid-cols-[1fr_400px] gap-10">
        <Tabs defaultValue="overview">
          <TabsList className="w-full md:max-w-[300px]">
            <TabsTrigger value="overview">
              <LayoutDashboard />
              Visão geral
            </TabsTrigger>

            <TabsTrigger value="content">
              <CirclePlay />
              Conteúdo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <p className="opacity-90 mt-4">{course.description}</p>
            <Separator className="my-6" />
            <div className="grid grid-cols-2 gap-6">
              {details.map((detail) => (
                <div key={detail.label} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <detail.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {detail.label}
                    </p>
                    <p>{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-4 flex flex-col gap-6">
            {course.modules.map((mod, index) => (
              <div className="flex items-center gap-4 bg-muted p-4 rounded-2xl">
                <div
                  className={cn(
                    "w-12 h-12 min-w-12 flex items-center justify-center border-2 border-primary",
                    "text-primary font-bold text-2xl rounded-full bg-primary/10",
                  )}
                >
                  {index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="sm:text-xl font-bold">{mod.title}</p>
                    <Badge variant="outline">
                      {mod.lessons.length} aula
                      {mod.lessons.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  {!!mod.description && (
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                      {mod.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
        <CourseProgress course={course} />
      </div>
    </section>
  );
}
