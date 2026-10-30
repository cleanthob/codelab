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
  const user = comment.user;

  const authorName = formatName(user.firstName, user.lastName);
  const distanceToNow = formatDistanceToNow(comment.createdAt, {
    addSuffix: true,
  });

  const [isReplying, setIsReplying] = useState(false);

  const actions = [
    {
      label: "Deletar",
      icon: Trash,
      onClick: () => {},
      hidden: false,
      disabled: false,
    },
    {
      label: "Responder",
      icon: MessageSquareQuote,
      onClick: () => {
        setIsReplying(true);
      },
      hidden: !canReply,
      disabled: false,
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
