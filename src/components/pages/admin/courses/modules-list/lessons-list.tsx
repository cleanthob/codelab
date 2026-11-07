import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip/index";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { CreateCourseFormData } from "@/server/schemas/course";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { GripVertical, Pen, Trash } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LessonFormItem } from "./manage-lesson-dialog";
type LessonsListProps = {
  moduleIndex: number;
  onEditLesson: (lesson: LessonFormItem) => void;
};

export const LessonsList = ({
  moduleIndex,
  onEditLesson,
}: LessonsListProps) => {
  const { control } = useFormContext<CreateCourseFormData>();

  const { fields, remove, move } = useFieldArray({
    control,
    name: `modules.${moduleIndex}.lessons`,
    keyName: "_id",
  });

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (destination) {
      move(source.index, destination.index);
    }
  };
  return (
    <div className="p-4 rounded-md bg-muted">
      {!fields.length && (
        <p className="text-sm text-muted-foreground text-center">
          Nenhuma aula adicionada
        </p>
      )}

      {!!fields.length && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lessons">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="overflow-hidden flex flex-col gap-2"
              >
                {fields.map((field, index) => (
                  <Draggable
                    key={`module-lessons-item-${field.id}`}
                    draggableId={`module-lessons-item-${field.id}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        className="w-full grid grid-cols-[30px_1fr] items-center bg-card/50 rounded-md overflow-hidden border border-input"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="w-full h-full bg-muted/50 flex items-center justify-center"
                        >
                          <GripVertical size={14} />
                        </div>

                        <div className="w-full h-full flex items-center justify-between gap-4 p-3">
                          <p className="font-semibold">{field.title}</p>

                          <div className="flex items-center gap-3">
                            <Tooltip content="Editar aula">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  onEditLesson(field);
                                }}
                              >
                                <Pen />
                              </Button>
                            </Tooltip>

                            <Tooltip content="Excluir aula">
                              <AlertDialog
                                title="Excluir"
                                description="Tem certeza que deseja excluir esta aula?"
                                onConfirm={() => remove(index)}
                              >
                                <Button variant="outline" size="icon">
                                  <Trash />
                                </Button>
                              </AlertDialog>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};
