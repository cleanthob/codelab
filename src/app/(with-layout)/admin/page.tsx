import { getNewUsersStats, getPurchasedCoursesStats } from "@/actions/stats";
import { StatsCharts } from "@/components/pages/admin/stats-charts";
import { connection } from "next/server";
import { Suspense } from "react";

export default function AdminPage() {
  return (
    <Suspense fallback={<p>Carregando estatísticas...</p>}>
      <AdminStats />
    </Suspense>
  );
}

async function AdminStats() {
  await connection();

  const [newUsersStats, purchasedCoursesStats] = await Promise.all([
    getNewUsersStats(),
    getPurchasedCoursesStats(),
  ]);

  return (
    <StatsCharts
      newUsersStats={newUsersStats}
      purchasedCoursesStats={purchasedCoursesStats}
    />
  );
}
