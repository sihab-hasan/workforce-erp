import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, Building2, ShieldAlert } from "lucide-react";
import type { GrowthDataPoint } from "../types/dashboard.types";

export interface GrowthChartProps {
  data?: GrowthDataPoint[] | undefined;
  loading?: boolean | undefined;
}

type MetricMode = "mrr" | "adoption" | "security";

export function GrowthChart({ data, loading }: GrowthChartProps) {
  const [metricMode, setMetricMode] = useState<MetricMode>("mrr");

  if (loading || !data || data.length === 0) {
    return (
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-72" />
          </div>
          <Skeleton className="h-8 w-44 rounded-lg" />
        </CardHeader>
        <CardContent className="pt-4">
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const latestPoint = data[data.length - 1];
  const firstPoint = data[0];

  const mrrGrowth =
    firstPoint && latestPoint && firstPoint.mrr > 0
      ? Math.round(((latestPoint.mrr - firstPoint.mrr) / firstPoint.mrr) * 100)
      : 14;

  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm dark:bg-card/40">
      <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold sm:text-lg">
              {metricMode === "mrr" && "Revenue & Platform Growth Velocity"}
              {metricMode === "adoption" && "Tenant & User Adoption Trends"}
              {metricMode === "security" && "Security Events & Audit Volume"}
            </CardTitle>
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/10 text-xs font-semibold text-primary"
            >
              <TrendingUp className="mr-1 size-3" />+{mrrGrowth}%
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground sm:text-sm">
            Interactive multi-dimensional timeseries analytics for workforce platform operations
          </CardDescription>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setMetricMode("mrr")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              metricMode === "mrr"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <DollarSign className="size-3.5" />
            <span>MRR ($)</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("adoption")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              metricMode === "adoption"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="size-3.5" />
            <span>Tenants & Users</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("security")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              metricMode === "security"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldAlert className="size-3.5" />
            <span>Security</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>

                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>

                <linearGradient id="tenantsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>

                <linearGradient id="securityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="opacity-10 text-border"
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickFormatter={(val) => (metricMode === "mrr" ? `$${val}` : `${val}`)}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0]?.payload as GrowthDataPoint;
                    return (
                      <div className="rounded-lg border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md">
                        <p className="text-xs font-semibold text-foreground">{d?.label || label}</p>
                        <div className="mt-2 space-y-1 text-xs">
                          {metricMode === "mrr" && (
                            <>
                              <div className="flex items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-purple-500 font-medium">
                                  <span className="size-2 rounded-full bg-purple-500" />
                                  Estimated MRR:
                                </span>
                                <span className="font-bold text-foreground">
                                  ${d?.mrr?.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-muted-foreground">
                                <span>Active Tenants:</span>
                                <span className="font-semibold text-foreground">
                                  {d?.totalTenants}
                                </span>
                              </div>
                            </>
                          )}

                          {metricMode === "adoption" && (
                            <>
                              <div className="flex items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-blue-500 font-medium">
                                  <span className="size-2 rounded-full bg-blue-500" />
                                  Total Users:
                                </span>
                                <span className="font-bold text-foreground">{d?.totalUsers}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                                  <span className="size-2 rounded-full bg-emerald-500" />
                                  Total Tenants:
                                </span>
                                <span className="font-bold text-foreground">{d?.totalTenants}</span>
                              </div>
                            </>
                          )}

                          {metricMode === "security" && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                                <span className="size-2 rounded-full bg-amber-500" />
                                Audit Events:
                              </span>
                              <span className="font-bold text-foreground">{d?.securityEvents}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {metricMode === "mrr" && (
                <Area
                  type="monotone"
                  dataKey="mrr"
                  name="MRR ($)"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#mrrGradient)"
                  activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2, fill: "#fff" }}
                />
              )}

              {metricMode === "adoption" && (
                <>
                  <Area
                    type="monotone"
                    dataKey="totalUsers"
                    name="Users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#usersGradient)"
                    activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalTenants"
                    name="Tenants"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#tenantsGradient)"
                    activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                  />
                </>
              )}

              {metricMode === "security" && (
                <Area
                  type="monotone"
                  dataKey="securityEvents"
                  name="Security Events"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#securityGradient)"
                  activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2, fill: "#fff" }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
