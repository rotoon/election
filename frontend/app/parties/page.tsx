"use client";

import VoterLayout from "@/components/shared/voter-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePartyStats } from "@/hooks/use-parties";
import type { PartyStats } from "@/types";
import { Info, Users } from "lucide-react";
import { useState } from "react";

export default function PartiesPage() {
  const { data: parties, isLoading } = usePartyStats();
  const [selectedParty, setSelectedParty] = useState<PartyStats | null>(null);

  if (isLoading) {
    return (
      <VoterLayout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </VoterLayout>
    );
  }

  return (
    <VoterLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            ข้อมูลพรรคการเมือง
          </h1>
          <p className="text-slate-500 mt-2">
            และจำนวนผู้ได้รับการเลือกตั้ง (อย่างไม่เป็นทางการ)
          </p>
        </div>

        <Dialog
          open={!!selectedParty}
          onOpenChange={(open) => !open && setSelectedParty(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center space-x-4 mb-4">
                {selectedParty?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedParty.logo_url}
                    alt={selectedParty.name}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div>
                  <DialogTitle className="text-2xl">
                    {selectedParty?.name}
                  </DialogTitle>
                  <div className="flex items-center mt-2">
                    <span
                      className="w-4 h-4 rounded-full mr-2 border"
                      style={{
                        backgroundColor: selectedParty?.color || "#ccc",
                      }}
                    />
                    <span className="text-sm text-slate-500">สีประจำพรรค</span>
                  </div>
                </div>
              </div>
              <DialogDescription className="text-base text-slate-700 whitespace-pre-line">
                <strong>นโยบายพรรค:</strong>
                <br />
                <br />
                {selectedParty?.policy || "ไม่มีข้อมูลนโยบาย"}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {parties?.map((party) => (
            <Card
              key={party.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setSelectedParty(party)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold truncate pr-2">
                  {party.name}
                </CardTitle>
                {party.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={party.logo_url}
                    alt={party.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-5xl font-extrabold tracking-tighter text-slate-900">
                    {party.mpCount}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    ที่นั่ง (S.S.)
                  </span>
                </div>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info className="w-4 h-4 mr-1" />
                  กดเพื่อดูนโยบาย
                </div>
                <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "100%",
                      backgroundColor: party.color || "#e2e8f0",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </VoterLayout>
  );
}
