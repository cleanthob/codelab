import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip/";
import { CreateCourseFormData } from "@/server/schemas/course";
import { GripVertical, Pen, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LessonsList } from "./lessons-list";
import { LessonFormItem, ManageLessonDialog } from "./manage-lesson-dialog";
import { ManageModuleDialog, ModuleFormItem } from "./manage-module-dialog";

export const ModulesList = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateCourseFormData>();

  const [showManageModuleDialog, setShowManageModuleDialog] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<ModuleFormItem | null>(null);
  const [showManageLessonDialog, setShowManageLessonDialog] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<LessonFormItem | null>(null);
  const [moduleIndex, setModuleIndex] = useState(0);

  const { fields, remove } = useFieldArray({
    control,
    name: "modules",
    keyName: "_id",
  });

  return (
    <div className="col-span-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Módulos</h2>

        <Button
          variant="outline"
          onClick={() => setShowManageModuleDialog(true)}
        >
          Adicionar módulo
          <Plus />
        </Button>
      </div>

      {!fields.length && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          Nenhum módulo adicionado
        </p>
      )}

      {!!fields.length && (
        <div className="overflow-hidden flex flex-col gap-4 mt-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="w-full grid grid-cols-[40px_1fr] items-center bg-muted/50 rounded-md overflow-hidden border border-input"
            >
              <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                <GripVertical />
              </div>
              <div className="w-full h-full flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold">{field.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {field.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Tooltip content="Editar módulo">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setModuleToEdit(field);
                          setShowManageModuleDialog(true);
                        }}
                      >
                        <Pen />
                      </Button>
                    </Tooltip>

                    <Tooltip content="Excluir módulo">
                      <AlertDialog
                        title="Excluir módulo"
                        description="Tem certeza que deseja excluir este módulo? Isso irá excluir todas as aulas deste módulo!"
                        onConfirm={() => remove(index)}
                      >
                        <Button variant="outline" size="icon">
                          <Trash />
                        </Button>
                      </AlertDialog>
                    </Tooltip>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setModuleIndex(index);
                        setShowManageLessonDialog(true);
                      }}
                    >
                      Adicionar aula <Plus />
                    </Button>
                  </div>
                </div>

                {/* LessonsList  */}
                <LessonsList
                  moduleIndex={index}
                  onEditLesson={(lesson) => {
                    setModuleIndex(index);
                    setLessonToEdit(lesson);
                    setShowManageLessonDialog(true);
                  }}
                />

                {!!errors?.modules?.[index]?.lessons?.message && (
                  <p className="text-sm text-destructive">
                    {errors?.modules?.[index]?.lessons?.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!!errors.modules?.message && (
        <p className="text-destructive text-sm text-center mt-4">
          {errors.modules.message}
        </p>
      )}

      <ManageModuleDialog
        open={showManageModuleDialog}
        setOpen={setShowManageModuleDialog}
        initialData={moduleToEdit}
        setInitialData={setModuleToEdit}
      />

      <ManageLessonDialog
        open={showManageLessonDialog}
        setOpen={setShowManageLessonDialog}
        moduleIndex={moduleIndex}
        initialData={lessonToEdit}
        setInitialData={setLessonToEdit}
      />
    </div>
  );
};
