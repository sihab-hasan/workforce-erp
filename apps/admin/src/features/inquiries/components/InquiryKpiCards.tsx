import { Card, CardContent } from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { CheckCircle2, Inbox, MailCheck, MessageSquare } from "lucide-react";
import type { InquiriesCounts } from "../types/inquiries.types";

interface InquiryKpiCardsProps {
  counts: InquiriesCounts;
  loading?: boolean;
}

export function InquiryKpiCards({ counts, loading }: InquiryKpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="border border-border/60 bg-card/60 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  const responseRate =
    counts.total > 0
      ? Math.round(((counts.responded + counts.archived) / counts.total) * 100)
      : 100;

  const cards = [
    {
      title: "Total Inquiries",
      value: counts.total.toLocaleString(),
      badge: "All time",
      description: "Submitted through web portal",
      icon: Inbox,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      accent: "from-blue-500 to-cyan-400",
    },
    {
      title: "New / Unread",
      value: counts.new.toLocaleString(),
      badge: counts.new > 0 ? "Action needed" : "All cleared",
      badgeVariant: counts.new > 0 ? "rose" : "default",
      description: "Awaiting platform administrator review",
      icon: MessageSquare,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      accent: "from-rose-500 to-orange-400",
      highlight: counts.new > 0,
    },
    {
      title: "Responded",
      value: counts.responded.toLocaleString(),
      badge: `${counts.responded} handled`,
      description: "Direct email or call outreach completed",
      icon: MailCheck,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      accent: "from-emerald-500 to-teal-400",
    },
    {
      title: "Resolution Rate",
      value: `${responseRate}%`,
      badge: responseRate >= 80 ? "Healthy" : "Needs attention",
      description: `${counts.archived} archived · ${counts.read} reviewing`,
      icon: CheckCircle2,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      accent: "from-purple-500 to-indigo-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`group relative overflow-hidden border bg-card/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-card/40 ${
              card.highlight
                ? "border-rose-500/40 ring-1 ring-rose-500/20"
                : "border-border/70 hover:border-border"
            }`}
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent} opacity-80 transition-opacity group-hover:opacity-100`}
            />

            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {card.title}
                </span>
                <div
                  className={`flex size-9 items-center justify-center rounded-lg border ${card.iconBg} ${card.iconColor} transition-transform duration-200 group-hover:scale-105`}
                >
                  <Icon className="size-4.5" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                  {card.value}
                </div>
                <Badge
                  variant="outline"
                  className={
                    card.badgeVariant === "rose"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium"
                      : "border-border/80 bg-muted/50 text-xs font-medium text-muted-foreground"
                  }
                >
                  {card.badge}
                </Badge>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
                <span className="truncate">{card.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
