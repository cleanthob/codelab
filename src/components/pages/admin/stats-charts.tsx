"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

type StatsChartsProps = {
  newUsersStats: StatsChartData[];
  purchasedCoursesStats: StatsChartData[];
};

const newAccountsChartConfig = {
  count: {
    label: "Usuários",
    color: "hsl(var((--chart-1))",
  },
} satisfies ChartConfig;

const coursesPurchasesChartConfig = {
  count: {
    label: "Compras",
    color: "hsl(var((--chart-1))",
  },
} satisfies ChartConfig;

export const StatsCharts = ({
  newUsersStats,
  purchasedCoursesStats,
}: StatsChartsProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-8 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Novos usuários</CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>

          <CardContent>
            <ChartContainer config={newAccountsChartConfig}>
              <AreaChart
                accessibilityLayer
                data={newUsersStats}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => format(value, "dd/MM")}
                  interval="preserveStartEnd"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <defs>
                  <linearGradient id="fillAccounts" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="count"
                  type="monotone"
                  fill="url(#fillAccounts)"
                  fillOpacity={0.4}
                  stroke="var(--primary)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cursos comprados</CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>

          <CardContent>
            <ChartContainer config={coursesPurchasesChartConfig}>
              <AreaChart
                accessibilityLayer
                data={purchasedCoursesStats}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => format(value, "dd/MM")}
                  interval="preserveStartEnd"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <defs>
                  <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="count"
                  type="monotone"
                  fill="url(#fillValue)"
                  fillOpacity={0.4}
                  stroke="var(--primary)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};
