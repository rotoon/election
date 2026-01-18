"use client";

import { PaginationBar } from "@/components/shared/pagination-bar";
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
  useManageConstituencies,
  useOpenAllPollsMutation,
  useTogglePollMutation,
} from "@/hooks/use-constituencies";
import { Lock, RefreshCw, Unlock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

// Wrapper component with Suspense boundary for useSearchParams
export default function ElectionControlPage() {
  return (
    <Suspense fallback={<ControlPageSkeleton />}>
      <ControlPageContent />
    </Suspense>
  );
}

function ControlPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-9 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="flex space-x-2">
          <div className="h-10 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-28 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border">
        <div className="h-10 w-full bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="border rounded-md p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ControlPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from URL params or use defaults
  const [filterProvince, setFilterProvince] = useState<string>(
    searchParams.get("province") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    parseInt(searchParams.get("limit") || "10")
  );

  // Update URL when params change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (filterProvince !== "all") params.set("province", filterProvince);
    if (currentPage !== 1) params.set("page", currentPage.toString());
    if (itemsPerPage !== 10) params.set("limit", itemsPerPage.toString());

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "/ec/control", {
      scroll: false,
    });
  }, [filterProvince, currentPage, itemsPerPage, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Hooks - server side pagination
  const { data, isLoading, refetch } = useManageConstituencies({
    province: filterProvince,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Get all constituencies for province dropdown
  const { data: allConstituencies } = useConstituencies();

  const togglePollMutation = useTogglePollMutation();
  const openAllMutation = useOpenAllPollsMutation();
  const closeAllMutation = useCloseAllPollsMutation();

  const constituencies = data?.constituencies || [];
  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: itemsPerPage,
    totalPages: 1,
  };

  // Get unique provinces for filter dropdown
  const provinces = useMemo(() => {
    return Array.from(
      new Set(allConstituencies?.map((c) => c.province) || [])
    ).sort();
  }, [allConstituencies]);

  // Handlers
  const handleFilterProvinceChange = (value: string) => {
    setFilterProvince(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  async function togglePoll(id: number, currentStatus: boolean) {
    togglePollMutation.mutate({ id, isOpen: !currentStatus });
  }

  async function toggleAll(open: boolean) {
    if (
      !confirm(
        `คุณต้องการที่จะ${open ? "เปิด" : "ปิด"}หีบเลือกตั้ง "ทุกเขต" ใช่หรือไม่?`
      )
    )
      return;

    if (open) {
      await openAllMutation.mutateAsync();
    } else {
      await closeAllMutation.mutateAsync();
    }
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

      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">จังหวัด:</span>
          <Select
            value={filterProvince}
            onValueChange={handleFilterProvinceChange}
          >
            <SelectTrigger className="w-[200px]">
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
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>

        <div className="flex-1" />

        <div className="text-sm text-muted-foreground">
          ทั้งหมด {meta.total} เขต
        </div>
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
            ) : constituencies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-24 text-muted-foreground"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              constituencies.map((c) => (
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

      {/* Pagination */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}
