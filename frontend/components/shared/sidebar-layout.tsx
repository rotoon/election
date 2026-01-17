'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LogOut, LucideIcon, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface SidebarLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  navItems: NavItem[]
  variant: 'admin' | 'ec'
  onLogout: () => void
}

export function SidebarLayout({
  children,
  title,
  subtitle,
  navItems,
  variant,
  onLogout,
}: SidebarLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Variant specific styles
  const styles = {
    admin: {
      title: 'text-neutral-900',
      activeItem: 'bg-neutral-900 text-white',
      inactiveItem: 'text-neutral-600 hover:bg-neutral-100',
    },
    ec: {
      title: 'text-blue-900',
      activeItem: 'bg-blue-50 text-blue-700',
      inactiveItem: 'text-neutral-600 hover:bg-neutral-100',
    },
  }

  const currentStyle = styles[variant]

  return (
    <div className='flex min-h-screen bg-neutral-50'>
      {/* Mobile Toggle */}
      <div className='md:hidden fixed top-0 w-full bg-white border-b z-50 px-4 py-3 flex justify-between items-center'>
        <div className='font-bold'>{title}</div>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className='w-6 h-6' />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white border-r border-neutral-200 fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className='p-6 mt-14 md:mt-0'>
          <h1 className={cn('text-xl font-bold', currentStyle.title)}>
            {title}
          </h1>
          <p className='text-sm text-neutral-500'>{subtitle}</p>
        </div>

        <nav className='px-4 space-y-1 flex-1 overflow-y-auto'>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  pathname === item.href
                    ? currentStyle.activeItem
                    : currentStyle.inactiveItem,
                )}
              >
                <Icon className='w-4 h-4 mr-3' />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className='p-4 border-t border-neutral-200 bg-white'>
          <Button
            variant='ghost'
            className='w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50'
            onClick={onLogout}
          >
            <LogOut className='w-4 h-4 mr-3' />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-8 md:ml-64 mt-14 md:mt-0'>{children}</main>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-30 md:hidden'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
