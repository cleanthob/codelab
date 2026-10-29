"use client";

import { markLessonsAsCompleted } from "@/actions/course-progress";
import { queryKeys } from "@/constants/query-keys";
import { queryClient } from "@/lib/tanstack-query";
import { usePreferencesStore } from "@/stores/preferences";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";

const VideoPlayer = dynamic(() => import("./video-player"), { ssr: false });

type LessonPlayerProps = {
  lesson: CourseLesson;
  nextLesson?: CourseLesson;
};

export const LessonPlayer = ({ lesson, nextLesson }: LessonPlayerProps) => {
  const params = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const autoplay = usePreferencesStore((state) => state.autoplay);
  const setExpandedModule = usePreferencesStore(
    (state) => state.setExpandedModule,
  );

  const videoId = lesson.videoId;
  const courseSlug = params.slug as string;

  const { mutateAsync: handleCompleteLesson } = useMutation({
    mutationFn: () =>
      markLessonsAsCompleted({ lessonId: lesson.id, courseSlug }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.courseProgress(courseSlug),
        exact: true,
      });

      router.refresh();
    },
  });

  const handleMoveToNextLesson = async () => {
    await handleCompleteLesson();

    if (!autoplay || !nextLesson) return;

    if (nextLesson.moduleId !== lesson.moduleId) {
      setExpandedModule(nextLesson.moduleId);
    }

    router.push(
      `/courses/${courseSlug}/${nextLesson.moduleId}/lesson/${nextLesson.id}`,
    );
  };

  return (
    <div key={videoId} className="overflow-hidden w-full aspect-video bg-black">
      <VideoPlayer
        videoId={lesson.videoId}
        autoplay={autoplay}
        onEnd={handleMoveToNextLesson}
      />
    </div>
  );
};
