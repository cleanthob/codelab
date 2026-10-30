"use client";

import { createLessonComment } from "@/actions/course-comments";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/constants/query-keys";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { undefined, z } from "zod";

const formSchema = z.object({
  content: z
    .string()
    .min(1, "Comentário é obrigatório")
    .max(500, "Comentário deve ter no máximo 500 caracteres"),
});

type FormData = z.infer<typeof formSchema>;

export const CommentInput = () => {
  const params = useParams();
  const queryClient = useQueryClient();

  const { user } = useUser();

  const courseSlug = params.slug as string;
  const lessonId = params.lessonId as string;

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const { mutate: createComment, isPending } = useMutation({
    mutationFn: createLessonComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lessonComments(lessonId),
      });

      reset();

      toast.success("Comentário criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar comentário!");
    },
  });

  const onSubmit = (data: FormData) => {
    createComment({
      courseSlug,
      lessonId,
      content: data.content,
    });
  };

  return (
    <form className="flex gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Avatar src={user?.imageUrl} fallback={user?.fullName} />

      <Controller
        control={control}
        name="content"
        render={({ field, fieldState }) => (
          <>
            <Textarea
              {...field}
              placeholder="Deixe seu comentário"
              className="min-h-[100px]"
            />
          </>
        )}
      />

      <Button type="submit" disabled={isPending}>
        Comentar
      </Button>
    </form>
  );
};
