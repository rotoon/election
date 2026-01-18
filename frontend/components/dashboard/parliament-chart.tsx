"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface PartyStat {
  id: number;
  name: string;
  color: string;
  seats: number;
  [key: string]: string | number | undefined;
}

interface ParliamentChartProps {
  data: PartyStat[];
}

export function ParliamentChart({ data }: ParliamentChartProps) {
  // Memoize sorted data and total calculation to prevent re-computation on every render
  const sortedData = useMemo(
    () => data.toSorted((a, b) => b.seats - a.seats),
    [data]
  );

  const totalSeats = useMemo(
    () => sortedData.reduce((acc, curr) => acc + curr.seats, 0),
    [sortedData]
  );

  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="100%" // Semi-circle at bottom
            startAngle={180}
            endAngle={0}
            innerRadius={110}
            outerRadius={160}
            paddingAngle={2}
            dataKey="seats"
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            itemStyle={{ color: "#1e293b", fontWeight: "bold" }}
            formatter={(
              value: number | string | undefined, // Widen to include undefined
              name: string | number | undefined, // Widen to include undefined
              props: { payload?: PartyStat }
            ) => [`${value ?? 0} Seats`, props.payload?.name]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div className="absolute bottom-0 left-0 right-0 text-center pb-4">
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
          Total Seats
        </p>
        <p className="text-5xl font-bold text-slate-900">{totalSeats}</p>
        <p className="text-slate-400 text-xs mt-1">/ 500</p>
      </div>
    </div>
  );
}
