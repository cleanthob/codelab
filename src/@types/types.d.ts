type Course = import("@/generated/prisma/client").Course;
type CourseTag = import("@/generated/prisma/client").CourseTag;
type CourseModule = import("@/generated/prisma/client").CourseModule;
type CourseLesson = import("@/generated/prisma/client").CourseLesson;
type CompletedLesson = import("@/generated/prisma/client").CompletedLesson;
type LessonComment = import("@/generated/prisma/client").LessonComment;
type User = import("@/generated/prisma/client").User;

type CourseWithTagsAndModules = Course & {
  tags: CourseTag[];
  modules: CourseModule[];
};

type CourseModuleWithLessons = CourseModule & {
  lessons: CourseLesson[];
};

type CourseWithModulesAndLessons = Course & {
  modules: CourseModuleWithLessons[];
};

type LessonCommentWithUserAndReplies = LessonComment & {
  user: User;
  replies?: LessonCommentWithUserAndReplies[];
};
