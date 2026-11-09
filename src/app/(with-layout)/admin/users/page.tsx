import { getAdminCourses } from "@/actions/courses";
import { getAdminUsers } from "@/actions/user";
import { UsersTable } from "@/components/pages/admin/users-table";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <>
      <h1 className="text-3xl font-bold">Usuários</h1>

      <UsersTable users={users} />
    </>
  );
}
