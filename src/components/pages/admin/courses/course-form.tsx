"use client";

import { createCourseTag, getCoursesTags } from "@/actions/courses";
import { BackButton } from "@/components/ui/back-button";
import { Dropzone } from "@/components/ui/dropzone";
import { FormField } from "@/components/ui/form/field";
import { InputField } from "@/components/ui/form/input-field";

import { Form } from "@/components/ui/form/primitives";
import { SelectField } from "@/components/ui/form/select-field";

import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { Separator } from "@/components/ui/separator";
import { queryKeys } from "@/constants/query-keys";
import { CourseDifficulty } from "@/generated/prisma/enums";
import { formatDifficulty } from "@/lib/utils";
import {
  CreateCourseFormData,
  createCourseSchema,
} from "@/server/schemas/course";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

export const CourseForm = () => {
  const queryClient = useQueryClient();
  const form = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      price: 0,
      discountPrice: "" as unknown as number,
      description: "",
      difficult: "EASY",
      thumbnail: undefined,
      tagsIds: [],
      modules: [],
    },
  });

  const { handleSubmit, control, setValue, watch } = form;

  const { data: tagsData } = useQuery({
    queryKey: queryKeys.courseTags,
    queryFn: getCoursesTags,
  });

  const tagsIds = watch("tagsIds");

  const { mutate: handleCreateTag, isPending: isAddingTag } = useMutation({
    mutationFn: createCourseTag,
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courseTags });

      setValue("tagsIds", [...tagsIds, newTag.id], { shouldValidate: true });
    },
  });

  const tagsOptions = useMemo(() => {
    return (tagsData ?? []).map((tag) => ({
      label: tag.name,
      value: tag.id,
    }));
  }, [tagsData]);

  const difficultyOptions = [
    {
      label: formatDifficulty(CourseDifficulty.EASY),
      value: CourseDifficulty.EASY,
    },
    {
      label: formatDifficulty(CourseDifficulty.MEDIUM),
      value: CourseDifficulty.MEDIUM,
    },
    {
      label: formatDifficulty(CourseDifficulty.HARD),
      value: CourseDifficulty.HARD,
    },
  ];

  const selectedTags = useMemo(() => {
    return tagsOptions.filter((tag) => tagsIds.includes(tag.value));
  }, [tagsOptions, tagsIds]);

  const handleChangeTags = (value: Option[]) => {
    const tagToCreate = value.find(
      (tag) => !tagsOptions.find((t) => t.value === tag.value),
    );

    if (tagToCreate) {
      handleCreateTag(tagToCreate.value);
      return;
    }

    console.log(tagToCreate);
    setValue(
      "tagsIds",
      value.map((option) => option.value),
      { shouldValidate: true },
    );
  };

  const onSubmit = (data: CreateCourseFormData) => {
    console.log(data);
  };

  return (
    <>
      <BackButton />

      <div>
        <h1 className="text-2xl font-bold">Criar curso</h1>
        <p className="text-muted-foreground mt-2">
          Preencha o formulário abaixo para adicionar um novo curso.
        </p>
      </div>

      <Separator className="my-2" />

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid md:grid-cols-2 gap-6"
        >
          <InputField
            name="title"
            label="Título"
            placeholder="Curso de React"
          />
          <InputField
            name="shortDescription"
            label="Descrição curta (opcional)"
            placeholder="Aprenda a criar uma aplicação de gerenciamento de tarefas."
          />

          <InputField name="price" label="Preço" placeholder="100" />
          <InputField
            name="discountPrice"
            label="Preço promocional (opcional)"
            placeholder="89.99"
          />
          <FormField control={control} name="tagsIds" label="Tags">
            {() => (
              <MultipleSelector
                options={tagsOptions}
                placeholder="Selecione as tags"
                creatable
                onChange={(value) => handleChangeTags(value)}
                value={selectedTags}
                disabled={isAddingTag}
              />
            )}
          </FormField>
          <SelectField
            name="difficulty"
            label="Dificuldade"
            options={difficultyOptions}
          />
          <FormField name="thumbnail" className="col-span-full">
            {({ field }) => (
              <Dropzone file={field.value} setFile={field.onChange} />
            )}
          </FormField>
        </form>
      </Form>
    </>
  );
};
