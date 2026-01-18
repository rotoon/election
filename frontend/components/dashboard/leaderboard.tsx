"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";

interface PartyStat {
  id: number;
  name: string;
  logoUrl: string;
  color: string;
  seats: number;
}

interface LeaderboardProps {
  data: PartyStat[];
  totalSeats: number;
}

export function Leaderboard({ data, totalSeats }: LeaderboardProps) {
  // Memoize sorted data to prevent re-sorting on every render
  const sortedData = useMemo(
    () => data.toSorted((a, b) => b.seats - a.seats),
    [data]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800">Party Leaderboard</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {sortedData.map((party) => {
          const percent = totalSeats > 0 ? (party.seats / totalSeats) * 100 : 0;
          return (
            <div
              key={party.id}
              className="px-6 py-4 flex items-center space-x-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-shrink-0 font-bold text-slate-400 w-6 text-center">
                {sortedData.indexOf(party) + 1}
              </div>
              <Avatar className="h-10 w-10 border border-slate-200">
                <AvatarImage src={party.logoUrl} alt={party.name} />
                <AvatarFallback
                  className="font-bold text-xs"
                  style={{
                    backgroundColor: party.color + "20",
                    color: party.color,
                  }}
                >
                  {party.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-semibold text-slate-900 truncate pr-2">
                    {party.name}
                  </h4>
                  <span className="text-xl font-bold text-slate-900">
                    {party.seats}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      Seats
                    </span>
                  </span>
                </div>
                <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: party.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No data available waiting for results...
          </div>
        )}
      </div>
    </div>
  );
}
