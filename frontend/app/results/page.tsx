"use client";

import VoterLayout from "@/components/shared/voter-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConstituencies } from "@/hooks/use-constituencies";
import { useConstituencyResults } from "@/hooks/use-vote";
import { Lock, TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function ResultsPage() {
  const { data: constituencies, isLoading: loadingConsts } =
    useConstituencies();
  const [selectedConstId, setSelectedConstId] = useState<string>("");

  // Auto-select first constituency
  useEffect(() => {
    if (constituencies && constituencies.length > 0 && !selectedConstId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedConstId(constituencies[0].id.toString());
    }
  }, [constituencies, selectedConstId]);

  const { data: resultData, isLoading: loadingResults } =
    useConstituencyResults(selectedConstId);

  const pollOpen = resultData?.pollOpen || false;
  const results = resultData?.results || [];
  const totalVotes = resultData?.totalVotes || 0;

  if (loadingConsts) {
    return (
      <VoterLayout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </VoterLayout>
    );
  }

  return (
    <VoterLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-center">
          ผลการเลือกตั้ง (อย่างไม่เป็นทางการ)
        </h1>

        {/* Selector */}
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <label className="text-sm font-medium">
                  เลือกเขตเลือกตั้งเพื่อดูผล:
                </label>
                <Select
                  value={selectedConstId}
                  onValueChange={setSelectedConstId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกเขตเลือกตั้ง" />
                  </SelectTrigger>
                  <SelectContent>
                    {constituencies?.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.province} เขต {c.zone_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {loadingResults ? (
          <div className="text-center py-10">กำลังโหลด...</div>
        ) : (
          <>
            {/* Status Indicator */}
            <div className="flex justify-center">
              {pollOpen ? (
                <div className="bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full flex items-center shadow-sm">
                  <Lock className="w-5 h-5 mr-2" />
                  หีบเลือกตั้งยังเปิดอยู่ - <strong>ไม่แสดงผลคะแนน</strong>
                </div>
              ) : (
                <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full flex items-center shadow-sm">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  หีบเลือกตั้งปิดแล้ว -{" "}
                  <strong>แสดงผลคะแนน (นับแล้ว {totalVotes} คะแนน)</strong>
                </div>
              )}
            </div>

            {/* Results List */}
            <div className="max-w-4xl mx-auto space-y-4">
              {results.length === 0 && (
                <div className="text-center text-slate-500">
                  ไม่พบข้อมูลผู้สมัครหรือผลคะแนน
                </div>
              )}
              {results.map((item) => (
                <Card
                  key={item.candidate.id}
                  className={`overflow-hidden transition-all ${
                    item.rank === 1 && !pollOpen
                      ? "border-2 border-yellow-400 shadow-xl ring-4 ring-yellow-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center p-4">
                    {/* Rank */}
                    {!pollOpen && (
                      <div
                        className={`w-12 text-center font-bold text-2xl mr-4 ${
                          item.rank === 1 ? "text-yellow-600" : "text-slate-400"
                        }`}
                      >
                        {item.rank}
                      </div>
                    )}

                    {/* Image */}
                    <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 mr-4">
                      {item.candidate.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.candidate.image_url}
                          alt={`${item.candidate.first_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">
                        {item.candidate.first_name} {item.candidate.last_name}
                        <span className="ml-2 text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block align-middle">
                          เบอร์ {item.candidate.candidate_number}
                        </span>
                      </h3>
                      <div className="flex items-center text-slate-600 text-sm mt-1">
                        {item.candidate.party?.logo_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.candidate.party.logo_url}
                            alt="Party"
                            className="w-4 h-4 mr-1"
                          />
                        )}
                        {item.candidate.party?.name || "อิสระ"}
                      </div>
                    </div>

                    {/* Score Bar (if closed) */}
                    {!pollOpen && (
                      <div className="w-32 md:w-64 flex flex-col items-end pl-4 border-l">
                        <span className="text-2xl font-bold tabular-nums text-slate-900">
                          {item.voteCount.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500">คะแนน</span>
                        {/* Progress Bar simulation */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${
                                totalVotes > 0
                                  ? (item.voteCount / totalVotes) * 100
                                  : 0
                              }%`,
                              backgroundColor:
                                item.candidate.party?.color || "#3b82f6",
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </VoterLayout>
  );
}
