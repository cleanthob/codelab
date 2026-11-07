import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog/";
import { Editor } from "@/components/ui/editor";
import { FormField } from "@/components/ui/form/field";
import { InputField } from "@/components/ui/form/input-field";
import { Form } from "@/components/ui/form/primitives";
import { CreateCourseFormData } from "@/server/schemas/course";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { set, z } from "zod";

const formSchema = z.object({
  title: z.string().nonempty("Campo obrigatório"),
  description: z.string().nonempty("Campo obrigatório"),
  videoId: z.string().nonempty("Campo obrigatório"),
  durationInMs: z.coerce.number().min(1, "Campo obrigatório"),
});

type LessonFormData = z.infer<typeof formSchema>;

export type LessonFormItem = LessonFormData & { id: string };

type ManageLessonDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  moduleIndex: number;
  initialData?: LessonFormItem | null;
  setInitialData: (data: LessonFormItem | null) => void;
};

export const ManageLessonDialog = ({
  open,
  setOpen,
  moduleIndex,
  initialData,
  setInitialData,
}: ManageLessonDialogProps) => {
  const {
    getValues,
    setValue,
    reset: resetForm,
  } = useFormContext<CreateCourseFormData>();

  const form = useForm<LessonFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      videoId: "",
      durationInMs: 0,
    },
  });

  const { handleSubmit, reset } = form;

  const isEditing = !!initialData;

  useEffect(() => {
    if (open && initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        videoId: initialData.videoId,
        durationInMs: initialData.durationInMs,
      });
    }

    if (!open) {
      reset({
        title: "",
        description: "",
        videoId: "",
        durationInMs: 0,
      });

      setInitialData(null);
    }
  }, [open, initialData, reset, setInitialData]);

  const onSubmit = (data: LessonFormData) => {
    const modules = getValues("modules");

    if (isEditing) {
      modules[moduleIndex].lessons = modules[moduleIndex].lessons.map(
        (lesson) => {
          if (lesson.id === initialData.id) {
            return { ...lesson, ...data };
          }
          return lesson;
        },
      );
    } else {
      modules[moduleIndex].lessons.push({ ...data, id: createId(), order: 1 });
    }

    setValue("modules", modules, { shouldValidate: true });
    resetForm(getValues());
    setOpen(false);
  };

  return (
    <Dialog
      title={isEditing ? "Editar aula" : "Adicionar aula"}
      open={open}
      setOpen={setOpen}
      content={
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <InputField name="title" label="Título" />
            <FormField name="description" label="Descrição">
              {({ field }) => (
                <Editor value={field.value} onChange={field.onChange} />
              )}
            </FormField>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField name="videoId" label="ID do vídeo" />
              <InputField
                name="durationInMs"
                label="Duração em milissegundos"
                type="number"
              />
            </div>
            <Button
              className="max-w-max ml-auto"
              onClick={() => handleSubmit(onSubmit)()}
            >
              {isEditing ? "Salvar" : "Adicionar"}
            </Button>
          </form>
        </Form>
      }
    />
  );
};
