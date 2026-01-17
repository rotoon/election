'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { LayoutDashboard, LogOut, Map, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useAuthStore()

  const handleLogout = async () => {
    setUser(null)
    router.push('/auth')
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
    { href: '/admin/constituencies', label: 'จัดการเขตเลือกตั้ง', icon: Map },
    { href: '/admin/users', label: 'จัดการผู้ใช้งาน', icon: Users },
  ]

  return (
    <div className='flex min-h-screen bg-neutral-50'>
      {/* Sidebar */}
      <aside className='w-64 bg-white border-r border-neutral-200 hidden md:flex md:flex-col md:fixed md:inset-y-0'>
        <div className='p-6'>
          <h1 className='text-xl font-bold text-neutral-900'>Admin Panel</h1>
          <p className='text-sm text-neutral-500'>ระบบเลือกตั้งออนไลน์</p>
        </div>
        <nav className='px-4 space-y-1 flex-1'>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100',
                )}
              >
                <Icon className='w-4 h-4 mr-3' />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className='p-4 border-t border-neutral-200'>
          <Button
            variant='ghost'
            className='w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50'
            onClick={handleLogout}
          >
            <LogOut className='w-4 h-4 mr-3' />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-8 md:ml-64'>{children}</main>
    </div>
  )
}
