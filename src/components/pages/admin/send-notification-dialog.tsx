"use client";

import { sendNotifications } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { InputField } from "@/components/ui/form/input-field";
import { Form } from "@/components/ui/form/primitives";
import { TextareaField } from "@/components/ui/form/textarea-field";
import {
  createNotificationSchema,
  CreateNotitificationSchema,
} from "@/server/schemas/notification";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type SendNotitificationDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const SendNotificationDialog = ({
  open,
  setOpen,
}: SendNotitificationDialogProps) => {
  const form = useForm<CreateNotitificationSchema>({
    resolver: zodResolver(createNotificationSchema),
    defaultValues: {
      title: "",
      content: "",
      link: "",
    },
  });

  const { handleSubmit } = form;

  const { mutate: handleSendNotifications, isPending } = useMutation({
    mutationFn: sendNotifications,
    onSuccess: () => {
      toast.success("Notificação enviada com sucesso!");
      setOpen(false);
    },
    onError: () => toast.error("Erro ao enviar notificação"),
  });

  const onSubmit = (data: CreateNotitificationSchema) => {
    handleSendNotifications(data);
  };

  return (
    <Dialog
      title="Enviar notificação"
      open={open}
      setOpen={setOpen}
      content={
        <div>
          <p className="text-sm text-muted-foreground mb-6">
            Preencha o formulário abaixo e envie uma notificação para todos os
            usuários.
          </p>

          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <InputField name="title" label="Título" />
              <TextareaField name="content" label="Contéudo" />
              <InputField name="link" label="Link" type="url" />

              <Button
                type="submit"
                className="mt-2 max-w-max ml-auto"
                disabled={isPending}
              >
                Enviar
              </Button>
            </form>
          </Form>
        </div>
      }
    />
  );
};
