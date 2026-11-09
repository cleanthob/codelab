import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatName } from "@/lib/utils";
import { cn } from "cn";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";

type AdminCommentItemProps = {
  comment: AdminComment;
};

export const AdminCommentItem = ({ comment }: AdminCommentItemProps) => {
  const { lesson, user, repliesCount } = comment;

  const course = lesson.module.course;
  const lessonModule = lesson.module;

  return (
    <Link
      href={`/courses/${course.slug}/${lessonModule.id}/lesson/${lesson.id}`}
      className={cn(
        "flex items-center justify-between gap-4 p-3 bg-muted rounded-lg border",
        "border-muted transition-all hover:border-primary flex-col md:flex-row",
      )}
    >
      <div className="flex items-center gap-4">
        <Avatar src={user.imageUrl} />
        <div className="flex-1">
          <div className="flex items-cneter gap-1.5 text-xs text-muted-foreground">
            <p>{formatName(user.firstName, user.lastName)}</p>
            <span>•</span>
            <p>{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</p>

            <span>•</span>

            <Badge
              className="text-xs"
              variant={repliesCount === 0 ? "destructive" : "outline"}
            >
              {repliesCount === 0
                ? "Sem resposta"
                : `${repliesCount} resposta${repliesCount === 1 ? "" : "s"}`}
            </Badge>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
      </div>

      <div className="flex item-center gap-3">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{course.title}</p>
          <p className="text-sm">{lesson.title}</p>
        </div>

        <Image
          src={course.thumbnail}
          alt={course.title}
          width={100}
          height={50}
          className="aspect-video rounded-md border border-muted-foreground object-cover"
        />
      </div>
    </Link>
  );
};
