"use client";

import { PaginationBar } from "@/components/shared/pagination-bar";
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
import { useManageUsers, useUpdateUserRoleMutation } from "@/hooks/use-users";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

const ROLE_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "voter", label: "Voter" },
  { value: "ec", label: "EC Member" },
  { value: "admin", label: "Admin" },
];

// Wrapper component with Suspense boundary for useSearchParams
export default function ManageUsersPage() {
  return (
    <Suspense fallback={<UsersPageSkeleton />}>
      <UsersPageContent />
    </Suspense>
  );
}

function UsersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-9 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
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

function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from URL params or use defaults
  const [filterRole, setFilterRole] = useState<string>(
    searchParams.get("role") || "all"
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
    if (filterRole !== "all") params.set("role", filterRole);
    if (currentPage !== 1) params.set("page", currentPage.toString());
    if (itemsPerPage !== 10) params.set("limit", itemsPerPage.toString());

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "/admin/users", {
      scroll: false,
    });
  }, [filterRole, currentPage, itemsPerPage, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Hooks - server side pagination
  const { data, isLoading } = useManageUsers({
    role: filterRole,
    page: currentPage,
    limit: itemsPerPage,
  });

  const updateRoleMutation = useUpdateUserRoleMutation();

  const users = data?.users || [];
  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: itemsPerPage,
    totalPages: 1,
  };

  // Handlers
  const handleFilterRoleChange = (value: string) => {
    setFilterRole(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  function handleRoleChange(userId: string, newRole: string) {
    if (confirm(`คุณต้องการเปลี่ยนสิทธิ์ผู้ใช้เป็น "${newRole}" ใช่หรือไม่?`)) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">จัดการผู้ใช้งาน</h2>
        <div className="text-sm text-muted-foreground">
          ทั้งหมด {meta.total} คน
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">ประเภท:</span>
          <Select value={filterRole} onValueChange={handleFilterRoleChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="ทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  ไม่พบผู้ใช้งาน
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
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
