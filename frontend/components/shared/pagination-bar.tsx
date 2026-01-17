'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (limit: number) => void
  pageSizeOptions?: number[]
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationBarProps) {
  return (
    <div className='flex items-center justify-between bg-white p-4 rounded-lg border'>
      <div className='flex items-center space-x-2'>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(val) => onItemsPerPageChange(parseInt(val))}
        >
          <SelectTrigger className='w-[120px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
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
          แสดง {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems}{' '}
          รายการ
        </div>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center space-x-1'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className='h-4 w-4' />
            <ChevronLeft className='h-4 w-4 -ml-2' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>

          {/* Page numbers Logic */}
          {(() => {
            const pages: (number | string)[] = []

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
                  onClick={() => onPageChange(page)}
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
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className='h-4 w-4' />
            <ChevronRight className='h-4 w-4 -ml-2' />
          </Button>
        </div>
      )}
    </div>
  )
}
