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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreatePartyMutation,
  useDeletePartyMutation,
  useParties,
  useUpdatePartyMutation,
  type Party,
} from "@/hooks/use-election";
import { Edit, Image as ImageIcon, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ManagePartiesPage() {
  const { data: parties, isLoading } = useParties();
  const createParty = useCreatePartyMutation();
  const updateParty = useUpdatePartyMutation();
  const deleteParty = useDeletePartyMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Form state
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [policy, setPolicy] = useState("");
  const [color, setColor] = useState("#000000");

  const resetForm = () => {
    setName("");
    setLogoUrl("");
    setPolicy("");
    setColor("#000000");
    setCurrentId(null);
    setIsEdit(false);
  };

  const handleEdit = (party: Party) => {
    setName(party.name);
    setLogoUrl(party.logo_url || "");
    setPolicy(party.policy || "");
    setColor(party.color || "#000000");
    setCurrentId(party.id);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error("กรุณาระบุชื่อพรรค");
      return;
    }

    const payload = {
      name,
      logo_url: logoUrl,
      policy,
      color,
    };

    try {
      if (isEdit && currentId) {
        await updateParty.mutateAsync({ id: currentId, payload });
      } else {
        await createParty.mutateAsync(payload);
      }
      setIsOpen(false);
      resetForm();
    } catch {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันลบพรรคการเมืองนี้?")) return;
    try {
      await deleteParty.mutateAsync(id);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          จัดการพรรคการเมือง
        </h2>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> เพิ่มพรรคการเมือง
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "แก้ไขพรรคการเมือง" : "เพิ่มพรรคการเมือง"}
              </DialogTitle>
              <DialogDescription>
                กำหนดชื่อ นโยบาย และสัญลักษณ์ของพรรค
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  ชื่อพรรค
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  placeholder="เช่น พรรคใจดี"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="logo" className="text-right">
                  Logo URL
                </Label>
                <Input
                  id="logo"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  สีประจำพรรค
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <span className="text-sm text-muted-foreground">{color}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="policy" className="text-right mt-2">
                  นโยบาย
                </Label>
                <Textarea
                  id="policy"
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                  className="col-span-3"
                  rows={4}
                  placeholder="นโยบายหลักของพรรค..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={createParty.isPending || updateParty.isPending}
              >
                {createParty.isPending || updateParty.isPending
                  ? "กำลังบันทึก..."
                  : isEdit
                  ? "บันทึกการแก้ไข"
                  : "บันทึก"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>ชื่อพรรค</TableHead>
              <TableHead>สี</TableHead>
              <TableHead>นโยบาย (ย่อ)</TableHead>
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
            ) : !parties || parties.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  ไม่พบข้อมูลพรรคการเมือง
                </TableCell>
              </TableRow>
            ) : (
              parties.map((p: Party) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.logo_url}
                        alt={p.name}
                        className="w-10 h-10 object-contain rounded-md bg-neutral-100"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-neutral-200 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-neutral-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: p.color || "#000000" }}
                      title={p.color || "#000000"}
                    />
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {p.policy}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(p)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(p.id)}
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
