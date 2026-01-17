'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  useConstituencies,
  useCreateConstituencyMutation,
  useDeleteConstituencyMutation,
  useAdminConstituencies,
} from '@/hooks/use-election'
import { ChevronLeft, ChevronRight, Plus, Trash } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export default function ManageConstituenciesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read from URL params or use defaults
  const [filterProvince, setFilterProvince] = useState<string>(
    searchParams.get('province') || 'all',
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
    if (filterProvince !== 'all') params.set('province', filterProvince)
    if (currentPage !== 1) params.set('page', currentPage.toString())
    if (itemsPerPage !== 10) params.set('limit', itemsPerPage.toString())

    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : '/admin/constituencies', {
      scroll: false,
    })
  }, [filterProvince, currentPage, itemsPerPage, router])

  useEffect(() => {
    updateURL()
  }, [updateURL])

  // Hooks - server side pagination
  const { data, isLoading, refetch } = useAdminConstituencies({
    province: filterProvince,
    page: currentPage,
    limit: itemsPerPage,
  })

  // Get all constituencies for province dropdown
  const { data: allConstituencies } = useConstituencies()

  const createConstituency = useCreateConstituencyMutation()
  const deleteConstituency = useDeleteConstituencyMutation()

  const constituencies = data?.constituencies || []
  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: itemsPerPage,
    totalPages: 1,
  }

  // Get unique provinces for filter dropdown
  const provinces = useMemo(() => {
    return Array.from(
      new Set(allConstituencies?.map((c) => c.province) || []),
    ).sort()
  }, [allConstituencies])

  const [isOpen, setIsOpen] = useState(false)
  const [province, setProvince] = useState('')
  const [zone, setZone] = useState('')

  // Handlers
  const handleFilterProvinceChange = (value: string) => {
    setFilterProvince(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  async function handleCreate() {
    if (!province || !zone) {
      toast.error('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    try {
      await createConstituency.mutateAsync({
        province,
        zoneNumber: parseInt(zone),
      })
      setIsOpen(false)
      setProvince('')
      setZone('')
      refetch()
    } catch {
      // Error handled in hook already
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('ยืนยันลบเขตเลือกตั้งนี้?')) return
    try {
      await deleteConstituency.mutateAsync(id)
      refetch()
    } catch {
      // Error handled in hook
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-3xl font-bold tracking-tight'>
          จัดการเขตเลือกตั้ง
        </h2>
        <Dialog
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> เพิ่มเขตเลือกตั้ง
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มเขตเลือกตั้งใหม่</DialogTitle>
              <DialogDescription>ระบุจังหวัดและหมายเลขเขต</DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label
                  htmlFor='province'
                  className='text-right'
                >
                  จังหวัด
                </Label>
                <Input
                  id='province'
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label
                  htmlFor='zone'
                  className='text-right'
                >
                  เขตที่
                </Label>
                <Input
                  id='zone'
                  type='number'
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className='col-span-3'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={createConstituency.isPending}
              >
                {createConstituency.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border'>
        <div className='flex items-center space-x-2'>
          <span className='text-sm font-medium'>จังหวัด:</span>
          <Select
            value={filterProvince}
            onValueChange={handleFilterProvinceChange}
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='ทั้งหมด' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>ทั้งหมด</SelectItem>
              {provinces.map((p) => (
                <SelectItem
                  key={p}
                  value={p}
                >
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex-1' />

        <div className='text-sm text-muted-foreground'>
          ทั้งหมด {meta.total} เขต
        </div>
      </div>

      <div className='border rounded-md'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>จังหวัด</TableHead>
              <TableHead>เขตที่</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
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
            ) : constituencies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center h-24 text-muted-foreground'
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
                      <span className='text-green-600 font-bold'>เปิด</span>
                    ) : (
                      <span className='text-red-600'>ปิด</span>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDelete(c.id)}
                      disabled={deleteConstituency.isPending}
                    >
                      <Trash className='h-4 w-4 text-red-500' />
                    </Button>
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
