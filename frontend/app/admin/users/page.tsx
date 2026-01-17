'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useManageUsers, useUpdateUserRoleMutation } from '@/hooks/use-election'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
const ROLE_OPTIONS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'voter', label: 'Voter' },
  { value: 'ec', label: 'EC Member' },
  { value: 'admin', label: 'Admin' },
]

export default function ManageUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read from URL params or use defaults
  const [filterRole, setFilterRole] = useState<string>(
    searchParams.get('role') || 'all',
  )
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1'),
  )
  const [itemsPerPage, setItemsPerPage] = useState(
    parseInt(searchParams.get('limit') || '10'),
  )

  // Update URL when params change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    if (filterRole !== 'all') params.set('role', filterRole)
    if (currentPage !== 1) params.set('page', currentPage.toString())
    if (itemsPerPage !== 10) params.set('limit', itemsPerPage.toString())

    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : '/admin/users', {
      scroll: false,
    })
  }, [filterRole, currentPage, itemsPerPage, router])

  useEffect(() => {
    updateURL()
  }, [updateURL])

  // Hooks - server side pagination
  const { data, isLoading } = useManageUsers({
    role: filterRole,
    page: currentPage,
    limit: itemsPerPage,
  })

  const updateRoleMutation = useUpdateUserRoleMutation()

  const users = data?.users || []
  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: itemsPerPage,
    totalPages: 1,
  }

  // Handlers
  const handleFilterRoleChange = (value: string) => {
    setFilterRole(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  function handleRoleChange(userId: string, newRole: string) {
    if (confirm(`คุณต้องการเปลี่ยนสิทธิ์ผู้ใช้เป็น "${newRole}" ใช่หรือไม่?`)) {
      updateRoleMutation.mutate({ userId, role: newRole })
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-3xl font-bold tracking-tight'>จัดการผู้ใช้งาน</h2>
        <div className='text-sm text-muted-foreground'>
          ทั้งหมด {meta.total} คน
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border'>
        <div className='flex items-center space-x-2'>
          <span className='text-sm font-medium'>ประเภท:</span>
          <Select
            value={filterRole}
            onValueChange={handleFilterRoleChange}
          >
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='ทั้งหมด' />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='border rounded-md'>
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
                  className='text-center h-24 text-muted-foreground'
                >
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center h-24 text-muted-foreground'
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
                      <SelectTrigger className='w-[150px]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='voter'>Voter</SelectItem>
                        <SelectItem value='ec'>EC Member</SelectItem>
                        <SelectItem value='admin'>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.created_at
                      ? format(new Date(u.created_at), 'dd MMM yyyy', {
                          locale: th,
                        })
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between bg-white p-4 rounded-lg border'>
        <div className='flex items-center space-x-2'>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className='w-[120px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem
                  key={size}
                  value={size.toString()}
                >
                  {size} รายการ
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='text-sm text-muted-foreground'>
            แสดง {meta.total > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
            {Math.min(currentPage * itemsPerPage, meta.total)} จาก {meta.total}{' '}
            รายการ
          </div>
        </div>

        {meta.totalPages > 1 && (
          <div className='flex items-center space-x-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className='h-4 w-4' />
              <ChevronLeft className='h-4 w-4 -ml-2' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            {/* Page numbers */}
            {(() => {
              const pages: (number | string)[] = []
              const totalPages = meta.totalPages

              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i)
              } else {
                if (currentPage <= 4) {
                  pages.push(1, 2, 3, 4, 5, '...', totalPages)
                } else if (currentPage >= totalPages - 3) {
                  pages.push(
                    1,
                    '...',
                    totalPages - 4,
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages,
                  )
                } else {
                  pages.push(
                    1,
                    '...',
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    '...',
                    totalPages,
                  )
                }
              }

              return pages.map((page, idx) =>
                typeof page === 'number' ? (
                  <Button
                    key={idx}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setCurrentPage(page)}
                    className='w-9'
                  >
                    {page}
                  </Button>
                ) : (
                  <span
                    key={idx}
                    className='px-2 text-muted-foreground'
                  >
                    ...
                  </span>
                ),
              )
            })()}

            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setCurrentPage((p) => Math.min(meta.totalPages, p + 1))
              }
              disabled={currentPage === meta.totalPages}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(meta.totalPages)}
              disabled={currentPage === meta.totalPages}
            >
              <ChevronRight className='h-4 w-4' />
              <ChevronRight className='h-4 w-4 -ml-2' />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
