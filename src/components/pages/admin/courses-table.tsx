"use client";

import { deleteCourse, updateCourseStatus } from "@/actions/courses";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip/index";
import { formatPrice, formatStatus } from "@/lib/utils";

import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Archive, Pencil, Send, Trash } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type CoursesTableProps = {
  courses: CourseWithTagsAndModules[];
};

export const CoursesTables = ({ courses }: CoursesTableProps) => {
  const [search, setSearch] = useState("");

  const { mutateAsync: handleDeleteCourse, isPending: isDeletingCourse } =
    useMutation({
      mutationFn: deleteCourse,
      onSuccess: () => toast.success("Curso deletado com sucesso!"),
      onError: () => toast.error("Erro ao deletar curso!"),
    });

  const { mutate: handleUpdateCourseStatus, isPending: isUpdatingStatus } =
    useMutation({
      mutationFn: updateCourseStatus,
      onSuccess: () => {
        toast.success("Status do curso atualizadoc com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao atualizar status do curso!");
      },
    });

  const columns: ColumnDef<CourseWithTagsAndModules, unknown>[] = [
    { header: "Título", accessorKey: "title" },
    {
      header: "Tags",
      accessorKey: "tags",
      cell: ({ row }) => {
        const tags = row.original.tags;
        const firstTwoTags = tags.slice(0, 2);
        const remainingTags = tags.slice(2);

        return (
          <div className="flex gap-1">
            {firstTwoTags.map((tag) => (
              <Badge key={`${row.original.id}-${tag.id}`} variant="outline">
                {tag.name}
              </Badge>
            ))}
            {remainingTags.length > 0 && (
              <Tooltip
                content={remainingTags.map((tag) => tag.name).join(", ")}
              >
                <Badge variant="outline">+{remainingTags.length}</Badge>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      header: "Preço",
      accessorKey: "price",
      cell: ({ row }) => {
        const { price, discountPrice } = row.original;

        return (
          <div className="flex-items-center gap-2">
            {!!discountPrice && (
              <span className="text-[10px] text-muted-foreground line-through">
                {formatPrice(price)}
              </span>
            )}

            {formatPrice(discountPrice ?? price)}
          </div>
        );
      },
    },
    {
      header: "Módulos",
      accessorKey: "modules",
      cell: ({ row }) => {
        const modules = row.original.modules;

        return `${modules.length} módulos`;
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <Badge variant={status === "PUBLISHED" ? "default" : "outline"}>
            {formatStatus(status)}
          </Badge>
        );
      },
    },
    {
      header: "Data de criação",
      accessorKey: "createdAt",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;

        return format(createdAt, "dd/MM/yyyy");
      },
    },
    {
      header: "",
      accessorKey: "actions",
      cell: ({ row }) => {
        const course = row.original;
        const status = course.status;

        const isPublished = status === "PUBLISHED";

        return (
          <div className="flex items-center gap-2 justify-end">
            <Tooltip
              content={`Alterar status para ${isPublished ? "Rascunho" : "Publicado"}`}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleUpdateCourseStatus({
                    courseId: course.id,
                    status: isPublished ? "DRAFT" : "PUBLISHED",
                  })
                }
                disabled={isUpdatingStatus}
              >
                {isPublished ? <Archive /> : <Send />}
              </Button>
            </Tooltip>
            <Tooltip content="Editar curso">
              <Link passHref href={`/admin/courses/edit/${course.id}`}>
                <Button variant="outline" size="icon">
                  <Pencil />
                </Button>
              </Link>
            </Tooltip>
            <Tooltip content="Excluir curso">
              <AlertDialog
                title="Excluir curso"
                description="Tem certeza que deseja excluir este curso? Essa ação não pode ser revertida."
                onConfirm={() => handleDeleteCourse(course.id)}
              >
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isDeletingCourse}
                >
                  <Trash />
                </Button>
              </AlertDialog>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const lowerSearch = search.toLowerCase();

      const titleMatch = course.title.toLowerCase().includes(lowerSearch);
      const tagsMatch = course.tags.some((tag) =>
        tag.name.toLowerCase().includes(lowerSearch),
      );

      return titleMatch || tagsMatch;
    });
  }, [courses, search]);

  return (
    <>
      <Input
        className="max-w-[400px]"
        placeholder="Pesquisar curso"
        value={search}
        onChange={({ target }) => setSearch(target.value)}
      />

      <DataTable data={filteredCourses} columns={columns} />
    </>
  );
};
