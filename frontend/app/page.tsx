"use client";

import { useDashboardStats } from "@/hooks/use-election";

import { Leaderboard } from "@/components/dashboard/leaderboard";
import { ParliamentChart } from "@/components/dashboard/parliament-chart";
import { ThailandMap } from "@/components/dashboard/thailand-map";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  BarChart3,
  RefreshCw,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import Link from "next/link";
import CountUp from "react-countup";

export default function Home() {
  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useDashboardStats();
  const totalProjecedSeats = 500;

  // Derive error message
  const error = queryError ? "Unable to load real-time results" : "";

  // Get Top 3 Parties for Sticky Header
  const topParties =
    data?.partyStats?.sort((a, b) => b.seats - a.seats).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <Vote className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                ELECTION
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                Official Results Center
              </p>
            </div>
          </div>

          {/* Sticky Bite-Sized Summary (Top 3) */}
          <div className="flex-1 flex justify-center mx-4 overflow-hidden">
            {loading ? (
              <div className="h-2 w-24 bg-slate-100 rounded animate-pulse"></div>
            ) : (
              <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar">
                {topParties.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center space-x-2 shrink-0"
                  >
                    <span className="text-xs font-bold text-slate-400 w-4">
                      {i + 1}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.logoUrl}
                      alt={p.name}
                      className="w-5 h-5 rounded-full object-cover border border-slate-100"
                    />
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {p.name}
                      </span>
                      <span
                        className="text-sm font-extrabold"
                        style={{ color: p.color || "#333" }}
                      >
                        <CountUp end={p.seats} duration={1} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/vote">
              <Button
                size="sm"
                className="font-bold shadow-md bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Vote
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
            <Button
              variant="link"
              onClick={() => refetch()}
              className="ml-auto text-red-700 font-bold"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Top Stats Cards (Odometer Effect) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-blue-200 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Total Votes
              </h3>
              <Vote className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-4xl font-extrabold text-slate-900 relative z-10">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                <CountUp
                  end={data?.totalVotes || 0}
                  separator=","
                  duration={2}
                />
              )}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1 flex items-center relative z-10">
              Verified Votes (Nationwide)
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-green-200 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Voter Turnout
              </h3>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-4xl font-extrabold text-slate-900 relative z-10">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                <CountUp
                  end={data?.turnout || 0}
                  decimals={2}
                  suffix="%"
                  duration={2.5}
                />
              )}
            </p>
            <div className="flex items-center text-xs text-green-600 font-bold mt-1 relative z-10">
              <TrendingUp className="w-3 h-3 mr-1" /> Strong Participation
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-purple-200 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Poll Status
              </h3>
              <RefreshCw
                className={`w-5 h-5 text-purple-500 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </div>
            <p className="text-4xl font-extrabold text-slate-900 relative z-10">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                <CountUp
                  end={data?.countingProgress || 0}
                  decimals={1}
                  suffix="%"
                  duration={2}
                />
              )}
            </p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden relative z-10">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${data?.countingProgress || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Constituencies Closed</p>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Parliament & Leaderboard (6 cols) */}
          <div className="lg:col-span-6 space-y-8">
            {/* Visual: Parliament Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Parliament Seats Projected
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Based on current vote tally in 400 constituencies + 100
                    Party List
                  </p>
                </div>
                <div className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500 border border-slate-200">
                  Target: 250 to Form Gov
                </div>
              </div>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center text-slate-400 animate-pulse bg-slate-50 rounded-lg">
                  Loading Chart...
                </div>
              ) : data && data.partyStats.length > 0 ? (
                <ParliamentChart data={data?.partyStats || []} />
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-100">
                  <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
                  <p>No seat projection available yet.</p>
                  <p className="text-sm">
                    Results will appear as counts come in.
                  </p>
                </div>
              )}
            </div>

            {/* Visual: Leaderboard */}
            <Leaderboard
              data={data?.partyStats || []}
              totalSeats={totalProjecedSeats}
            />
          </div>

          {/* Right Column: Live Map (6cols) */}
          <div className="lg:col-span-6 space-y-6">
            <ThailandMap />
          </div>
        </section>
      </main>
    </div>
  );
}
