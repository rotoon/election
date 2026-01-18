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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCandidateMutation,
  useDeleteCandidateMutation,
  useManageCandidates,
} from "@/hooks/use-candidates";
import { Constituency, useConstituencies } from "@/hooks/use-constituencies";
import { useParties } from "@/hooks/use-parties";
import { Plus, Trash, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Wrapper component with Suspense boundary for useSearchParams
export default function ManageCandidatesPage() {
  return (
    <Suspense fallback={<CandidatesPageSkeleton />}>
      <CandidatesPageContent />
    </Suspense>
  );
}

function CandidatesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-9 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
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

function CandidatesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from URL params or use defaults
  const [filterConstituency, setFilterConstituency] = useState<string>(
    searchParams.get("constituency") || "all"
  );
  const [filterParty, setFilterParty] = useState<string>(
    searchParams.get("party") || "all"
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
    if (filterConstituency !== "all")
      params.set("constituency", filterConstituency);
    if (filterParty !== "all") params.set("party", filterParty);
    if (currentPage !== 1) params.set("page", currentPage.toString());
    if (itemsPerPage !== 10) params.set("limit", itemsPerPage.toString());

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "/ec/candidates", {
      scroll: false,
    });
  }, [filterConstituency, filterParty, currentPage, itemsPerPage, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Hooks - now using server-side pagination
  const { data, isLoading } = useManageCandidates({
    constituencyId: filterConstituency,
    partyId: filterParty,
    page: currentPage,
    limit: itemsPerPage,
  });
  const { data: parties } = useParties();
  const { data: constituencies } = useConstituencies();

  const candidates = data?.candidates || [];
  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: itemsPerPage,
    totalPages: 1,
  };

  const createMutation = useCreateCandidateMutation();
  const deleteMutation = useDeleteCandidateMutation();

  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [number, setNumber] = useState("");
  const [partyId, setPartyId] = useState("");
  const [constituencyId, setConstituencyId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [policy, setPolicy] = useState("");
  const [nationalId, setNationalId] = useState("");

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setNumber("");
    setPartyId("");
    setConstituencyId("");
    setImageUrl("");
    setPolicy("");
    setNationalId("");
  };

  async function handleCreate() {
    if (
      !firstName ||
      !lastName ||
      !number ||
      !partyId ||
      !constituencyId ||
      !nationalId
    ) {
      toast.error("กรุณากรอกข้อมูลสำคัญให้ครบ");
      return;
    }

    createMutation.mutate(
      {
        first_name: firstName,
        last_name: lastName,
        candidate_number: parseInt(number),
        party_id: parseInt(partyId),
        constituency_id: parseInt(constituencyId),
        image_url: imageUrl,

        personal_policy: policy,
        national_id: nationalId,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
        },
      }
    );
  }

  // Helper formats
  const formatConstituency = (c: Constituency | null | undefined) =>
    c ? `${c.province} เขต ${c.zone_number}` : "-";

  // Reset page when filters change
  const handleFilterPartyChange = (value: string) => {
    setFilterParty(value);
    setCurrentPage(1);
  };

  const handleFilterConstituencyChange = (value: string) => {
    setFilterConstituency(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">จัดการผู้สมัคร</h2>
        <Input
          className="w-64"
          type="text"
          disabled
          value={`จำนวนผู้สมัคร: ${meta.total} รายการ`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">เขต:</span>
          <Select
            value={filterConstituency}
            onValueChange={handleFilterConstituencyChange}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="เลือกเขตเลือกตั้ง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {constituencies?.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.province} เขต {c.zone_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">พรรค:</span>
          <Select value={filterParty} onValueChange={handleFilterPartyChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="เลือกพรรค" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {parties?.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1"></div>

        <Dialog
          open={isOpen}
          onOpenChange={(v) => {
            setIsOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> เพิ่มผู้สมัคร
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>เพิ่มผู้สมัครใหม่</DialogTitle>
              <DialogDescription>
                กำหนดข้อมูลผู้สมัคร สังกัดพรรค และเขตเลือกตั้ง
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationalId">เลขบัตร ปชช.</Label>
                  <Input
                    id="nationalId"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    maxLength={13}
                    placeholder="13 หลัก"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fname">ชื่อ</Label>
                  <Input
                    id="fname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lname">นามสกุล</Label>
                  <Input
                    id="lname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="c_id">เขตเลือกตั้ง</Label>
                  <Select
                    value={constituencyId}
                    onValueChange={setConstituencyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกเขต" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {constituencies?.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.province} เขต {c.zone_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">หมายเลข</Label>
                  <Input
                    id="number"
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="เช่น 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party">พรรคสังกัด</Label>
                  <Select value={partyId} onValueChange={setPartyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกพรรค" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="img">รูปโปรไฟล์ (URL)</Label>
                <Input
                  id="img"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policy">นโยบายส่วนตัว (ถ้ามี)</Label>
                <Textarea
                  id="policy"
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เบอร์</TableHead>
              <TableHead>รูป</TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>สังกัดพรรค</TableHead>
              <TableHead>เขตเลือกตั้ง</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : !candidates || candidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  ไม่พบผู้สมัครในเขตนี้
                </TableCell>
              </TableRow>
            ) : candidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  ไม่พบผู้สมัครตามเงื่อนไขที่เลือก
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              candidates.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold text-lg text-blue-600">
                    {c.candidate_number}
                  </TableCell>
                  <TableCell>
                    {c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image_url}
                        alt="Candidate"
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-neutral-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.first_name} {c.last_name}
                  </TableCell>
                  <TableCell>
                    {c.parties?.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.parties.logo_url}
                        alt="Party Logo"
                        className="w-5 h-5 inline mr-2 rounded-full"
                      />
                    )}
                    {c.parties?.name || "-"}
                  </TableCell>
                  <TableCell>{formatConstituency(c.constituencies)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (
                          confirm(
                            `ยืนยันการลบผู้สมัครหมายเลข ${c.candidate_number} (${c.first_name})?`
                          )
                        ) {
                          deleteMutation.mutate(c.id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4" />
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
