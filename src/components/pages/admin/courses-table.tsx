"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { formatPrice, formatStatus } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Send, Trash } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type CoursesTableProps = {
  courses: CourseWithTagsAndModules[];
};

export const CoursesTables = ({ courses }: CoursesTableProps) => {
  const [search, setSearch] = useState("");

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

        return (
          <div className="flex items-center gap-2 justify-end">
            <Tooltip content="Alterar status para publicado">
              <Button variant="outline" size="icon">
                <Send />
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
              <Button variant="outline" size="icon">
                <Trash />
              </Button>
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
