"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { formatName } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { SendNotificationDialog } from "./send-notification-dialog";
import { DataTableFeatures } from "@/components/ui/data-table/data-table-features";

type UsersTableProps = {
  users: AdminUser[];
};

export const UsersTable = ({ users }: UsersTableProps) => {
  const [search, setSearch] = useState("");
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const lowerSearch = search.toLowerCase();

      const nameMatch = formatName(user.firstName, user.lastName)
        .toLowerCase()
        .includes(lowerSearch);
      const emailMatch = user.email.toLowerCase().includes(lowerSearch);

      return nameMatch || emailMatch;
    });
  }, [search, users]);

  const columns: ColumnDef<DataTableFeatures, AdminUser>[] = [
    {
      header: "Nome",
      accessorKey: "firstName",
      cell: ({ row }) => {
        const user = row.original;

        const fullName = formatName(user.firstName, user.lastName);

        return (
          <div className="flex items-center gap-2 p-2">
            <Avatar src={user.imageUrl} fallback={fullName} />
            <p className="font-medium">{fullName} </p>
          </div>
        );
      },
    },
    { header: "Email", accessorKey: "email" },
    { header: "Cursos comprados", accessorKey: "purchasedCourses" },
    { header: "Aulas concluídas", accessorKey: "completedLessons" },
    {
      header: "Data de criação",
      accessorKey: "createdAt",
      cell: ({ row }) => {
        const user = row.original;

        return format(user.createdAt, "dd/MM/yyyy HH:mm");
      },
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Pesquisar usuário"
          className="max-w-[400px]"
          value={search}
          onChange={({ target }) => setSearch(target.value)}
        />

        <Button onClick={() => setShowNotificationDialog(true)}>
          Enviar notificação
        </Button>
      </div>
      <DataTable columns={columns} data={filteredUsers} />

      <SendNotificationDialog
        open={showNotificationDialog}
        setOpen={setShowNotificationDialog}
      />
    </>
  );
};
