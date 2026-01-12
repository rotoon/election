"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCloseAllPollsMutation,
  useConstituencies,
  useOpenAllPollsMutation,
  useTogglePollMutation,
} from "@/hooks/use-election";
import { Lock, RefreshCw, Unlock } from "lucide-react";
import { useMemo, useState } from "react";

export default function ElectionControlPage() {
  const { data: constituencies, isLoading, refetch } = useConstituencies();
  const togglePollMutation = useTogglePollMutation();
  const openAllMutation = useOpenAllPollsMutation();
  const closeAllMutation = useCloseAllPollsMutation();

  const [filterProvince, setFilterProvince] = useState<string>("all");

  const provinces = useMemo(() => {
    return Array.from(new Set(constituencies?.map((c) => c.province) || []));
  }, [constituencies]);

  const filteredConstituencies = useMemo(() => {
    if (!constituencies) return [];
    return filterProvince === "all"
      ? constituencies
      : constituencies.filter((c) => c.province === filterProvince);
  }, [constituencies, filterProvince]);

  async function togglePoll(id: number, currentStatus: boolean) {
    togglePollMutation.mutate({ id, isOpen: !currentStatus });
  }

  // Batch actions
  async function toggleAll(open: boolean) {
    if (
      !confirm(
        `คุณต้องการที่จะ${
          open ? "เปิด" : "ปิด"
        }หีบเลือกตั้ง "ทุกเขต" ใช่หรือไม่?`
      )
    )
      return;

    if (open) {
      await openAllMutation.mutateAsync();
    } else {
      await closeAllMutation.mutateAsync();
    }
    // refetch handled by hook invalidation
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          ควบคุมการเลือกตั้ง
        </h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border-green-200"
            onClick={() => toggleAll(true)}
            disabled={openAllMutation.isPending || closeAllMutation.isPending}
          >
            <Unlock className="w-4 h-4 mr-2" /> เปิดทุกเขต
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
            onClick={() => toggleAll(false)}
            disabled={openAllMutation.isPending || closeAllMutation.isPending}
          >
            <Lock className="w-4 h-4 mr-2" /> ปิดทุกเขต
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border">
        <span className="text-sm font-medium">กรองจังหวัด:</span>
        <Select value={filterProvince} onValueChange={setFilterProvince}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {provinces.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>จังหวัด</TableHead>
              <TableHead>เขตที่</TableHead>
              <TableHead>สถานะปัจจุบัน</TableHead>
              <TableHead className="text-right">เปลี่ยนสถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-24 text-muted-foreground"
                >
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : filteredConstituencies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-24 text-muted-foreground"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredConstituencies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.province}</TableCell>
                  <TableCell>{c.zone_number}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        c.is_poll_open
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.is_poll_open ? "OPEN (เปิดหีบ)" : "CLOSED (ปิดหีบ)"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={c.is_poll_open ? "destructive" : "default"}
                      onClick={() => togglePoll(c.id, c.is_poll_open)}
                      disabled={togglePollMutation.isPending}
                      className={
                        !c.is_poll_open ? "bg-green-600 hover:bg-green-700" : ""
                      }
                    >
                      {c.is_poll_open ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" /> ปิดหีบ
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 mr-1" /> เปิดหีบ
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
