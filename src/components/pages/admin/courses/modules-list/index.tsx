import { Button } from "@/components/ui/button";
import { CreateCourseFormData } from "@/server/schemas/course";
import { GripVertical, Pen, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ManageModuleDialog } from "./manage-module-dialog";
import { Tooltip } from "@/components/ui/tooltip/";
import { LessonsList } from "./lessons-list";

export const ModulesList = () => {
  const { control } = useFormContext<CreateCourseFormData>();

  const [showManageModuleDialog, setShowManageModuleDialog] = useState(false);

  const { fields } = useFieldArray({
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
                    <Button variant="outline" size="icon">
                      <Pen />
                    </Button>
                  </Tooltip>

                  <Tooltip content="Excluir módulo">
                    <Button variant="outline" size="icon">
                      <Trash />
                    </Button>
                  </Tooltip>

                  <Button variant="outline">
                    Adicionar aula <Plus />
                  </Button>
                </div>
              </div>

              {/* LessonsList  */}
              <LessonsList />
            </div>
          </div>
        ))}
      </div>

      <ManageModuleDialog
        open={showManageModuleDialog}
        setOpen={setShowManageModuleDialog}
      />
    </div>
  );
};
