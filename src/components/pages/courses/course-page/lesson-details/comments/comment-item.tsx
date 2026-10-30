"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { formatName } from "@/lib/utils";
import { cn } from "cn";
import { formatDistanceToNow } from "date-fns";
import { MessageSquareQuote, Trash } from "lucide-react";
import { useState } from "react";
import { CommentInput } from "./comment-input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteComment } from "@/actions/course-comments";
import { queryKeys } from "@/constants/query-keys";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

type CommentItemProps = {
  comment: LessonCommentWithUserAndReplies;
  className?: string;
  parentCommentId?: string;
  canReply?: boolean;
};

export const CommentItem = ({
  comment,
  className,
  parentCommentId,
  canReply = true,
}: CommentItemProps) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useUser();
  const isAdmin = currentUser?.publicMetadata?.role === "admin";
  const user = comment.user;

  const authorName = formatName(user.firstName, user.lastName);
  const distanceToNow = formatDistanceToNow(comment.createdAt, {
    addSuffix: true,
  });

  const [isReplying, setIsReplying] = useState(false);

  const { mutate: handleDeleteComment, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lessonComments(comment.lessonId),
      });
      toast.success("Comentário deletado com sucesso!");
    },
    onError: () => {
      toast.success("Erro ao deletar comentário!");
    },
  });

  const canDelete = comment?.user?.clerkUserId === currentUser?.id || isAdmin;

  const actions = [
    {
      label: "Deletar",
      icon: Trash,
      onClick: () => {
        handleDeleteComment();
      },
      hidden: !canDelete,
      disabled: isDeleting,
    },
    {
      label: "Responder",
      icon: MessageSquareQuote,
      onClick: () => {
        setIsReplying(true);
      },
      hidden: !canReply,
    },
  ];

  const replies = comment?.replies ?? [];

  return (
    <div
      className={cn(
        "p-4 rounded-lg bg-card flex flex-col gap-3 text-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Avatar src={user.imageUrl} fallback={authorName} />

          <p>{authorName}</p>

          <span className="text-xs text-muted-foreground">{distanceToNow}</span>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action) => {
            if (action.hidden) return null;

            return (
              <Tooltip
                key={`comment-${comment.id}-action-${action.label}`}
                content={action.label}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  <action.icon />
                </Button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <p className="text-muted-foreground">{comment.content}</p>

      {!!replies.length && (
        <div className="pl-4 flex flex-col gap-2">
          {replies.map((reply, index) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              parentCommentId={comment.id}
              className="bg-muted p-3"
              canReply={index === replies.length - 1}
            />
          ))}
        </div>
      )}

      {isReplying && (
        <CommentInput
          parentCommentId={parentCommentId ?? comment.id}
          autoFocus
          onCancel={() => setIsReplying(false)}
          onSuccess={() => setIsReplying(false)}
          className="bg-muted p-4 rounded-lg flex-col sm:flex-orw"
        />
      )}
    </div>
  );
};
