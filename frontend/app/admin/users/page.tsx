"use client";

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
import { useUpdateUserRoleMutation, useUsers } from "@/hooks/use-election";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function ManageUsersPage() {
  const { data: users, isLoading } = useUsers();
  const updateRoleMutation = useUpdateUserRoleMutation();

  function handleRoleChange(userId: string, newRole: string) {
    if (confirm(`คุณต้องการเปลี่ยนสิทธิ์ผู้ใช้เป็น "${newRole}" ใช่หรือไม่?`)) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">จัดการผู้ใช้งาน</h2>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>เลขบัตรประชาชน</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>วันที่สมัคร</TableHead>
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
            ) : !users || users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  ไม่พบผู้ใช้งาน
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              users.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.national_id}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={u.role}
                      onValueChange={(val) => handleRoleChange(u.id, val)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voter">Voter</SelectItem>
                        <SelectItem value="ec">EC Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.created_at
                      ? format(new Date(u.created_at), "dd MMM yyyy", {
                          locale: th,
                        })
                      : "-"}
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
