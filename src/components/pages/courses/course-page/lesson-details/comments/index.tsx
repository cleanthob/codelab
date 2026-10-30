import { CommentInput } from "./comment-input";

export const LessonComments = () => {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Comentários</h3>
      <CommentInput />
    </div>
  );
};
