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
  Constituency,
  useConstituencies,
  useCreateCandidateMutation,
  useDeleteCandidateMutation,
  useManageCandidates,
  useParties,
} from "@/hooks/use-election";
import { Plus, Trash, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ManageCandidatesPage() {
  const [filterConstituency, setFilterConstituency] = useState<string>("all");

  // Hooks
  const { data: candidates, isLoading } =
    useManageCandidates(filterConstituency);
  const { data: parties } = useParties();
  const { data: constituencies } = useConstituencies();

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

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setNumber("");
    setPartyId("");
    setConstituencyId("");
    setImageUrl("");
    setPolicy("");
  };

  async function handleCreate() {
    if (!firstName || !lastName || !number || !partyId || !constituencyId) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">จัดการผู้สมัคร</h2>
        <Input
          className="w-64"
          type="text"
          disabled
          value={`จำนวนผู้สมัครทั้งหมด: ${candidates?.length || 0}`}
        />
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border">
        <span className="text-sm font-medium">กรองตามเขตเลือกตั้ง:</span>
        <Select
          value={filterConstituency}
          onValueChange={setFilterConstituency}
        >
          <SelectTrigger className="w-[300px]">
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
              <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}
