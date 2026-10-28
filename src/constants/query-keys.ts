export const queryKeys = {
  courseProgress: (courseSlug: string) => ["course-progress", courseSlug],
} as const;
