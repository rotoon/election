"use client";

import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useAdminConstituencies,
  useConstituencies,
  useCreateConstituencyMutation,
  useDeleteConstituencyMutation,
} from "@/hooks/use-constituencies";
import { Plus, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Wrapper component with Suspense boundary for useSearchParams
export default function ManageConstituenciesPage() {
  return (
    <Suspense fallback={<ConstituenciesPageSkeleton />}>
      <ConstituenciesPageContent />
    </Suspense>
  );
}

function ConstituenciesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-9 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" />
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

function ConstituenciesPageContent() {
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
    router.push(queryString ? `?${queryString}` : "/admin/constituencies", {
      scroll: false,
    });
  }, [filterProvince, currentPage, itemsPerPage, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Hooks - server side pagination
  const { data, isLoading, refetch } = useAdminConstituencies({
    province: filterProvince,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Get all constituencies for province dropdown
  const { data: allConstituencies } = useConstituencies();

  const createConstituency = useCreateConstituencyMutation();
  const deleteConstituency = useDeleteConstituencyMutation();

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

  const [isOpen, setIsOpen] = useState(false);
  const [province, setProvince] = useState("");
  const [zone, setZone] = useState("");

  // Handlers
  const handleFilterProvinceChange = (value: string) => {
    setFilterProvince(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  async function handleCreate() {
    if (!province || !zone) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      await createConstituency.mutateAsync({
        province,
        zoneNumber: parseInt(zone),
      });
      setIsOpen(false);
      setProvince("");
      setZone("");
      refetch();
    } catch {
      // Error handled in hook already
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("ยืนยันลบเขตเลือกตั้งนี้?")) return;
    try {
      await deleteConstituency.mutateAsync(id);
      refetch();
    } catch {
      // Error handled in hook
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          จัดการเขตเลือกตั้ง
        </h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> เพิ่มเขตเลือกตั้ง
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มเขตเลือกตั้งใหม่</DialogTitle>
              <DialogDescription>ระบุจังหวัดและหมายเลขเขต</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="province" className="text-right">
                  จังหวัด
                </Label>
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="zone" className="text-right">
                  เขตที่
                </Label>
                <Input
                  id="zone"
                  type="number"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={createConstituency.isPending}
              >
                {createConstituency.isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

        <div className="flex-1" />

        <div className="text-sm text-muted-foreground">
          ทั้งหมด {meta.total} เขต
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>จังหวัด</TableHead>
              <TableHead>เขตที่</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : constituencies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              constituencies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.province}</TableCell>
                  <TableCell>{c.zone_number}</TableCell>
                  <TableCell>
                    {c.is_poll_open ? (
                      <span className="text-green-600 font-bold">เปิด</span>
                    ) : (
                      <span className="text-red-600">ปิด</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(c.id)}
                      disabled={deleteConstituency.isPending}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
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
