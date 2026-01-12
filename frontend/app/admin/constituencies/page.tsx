"use client";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useConstituencies,
  useCreateConstituencyMutation,
  useDeleteConstituencyMutation,
} from "@/hooks/use-election";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ManageConstituenciesPage() {
  const { data: constituencies, isLoading } = useConstituencies();
  const createConstituency = useCreateConstituencyMutation();
  const deleteConstituency = useDeleteConstituencyMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [province, setProvince] = useState("");
  const [zone, setZone] = useState("");

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
    } catch {
      // Error handled in hook already
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("ยืนยันลบเขตเลือกตั้งนี้?")) return;
    try {
      await deleteConstituency.mutateAsync(id);
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
            ) : !constituencies || constituencies.length === 0 ? (
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
    </div>
  );
}
