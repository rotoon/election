"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useECStats } from "@/hooks/use-admin";
import { Flag, Users, Vote } from "lucide-react";

export default function ECDashboard() {
  const { data: stats, isLoading } = useECStats();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const statItems = [
    {
      label: "พรรคการเมือง",
      value: stats?.totalParties.toLocaleString() || "0",
      icon: Flag,
      desc: "พรรคในระบบ",
    },
    {
      label: "ผู้สมัครทั้งหมด",
      value: stats?.totalCandidates.toLocaleString() || "0",
      icon: Users,
      desc: "คนทั่วประเทศ",
    },
    {
      label: "ผู้ใช้สิทธิแล้ว",
      value: stats?.votedCount.toLocaleString() || "0",
      icon: Vote,
      desc: `คิดเป็น ${stats?.votedPercentage}% ของผู้มีสิทธิ`,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-blue-900">
        EC Dashboard
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {statItems.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
