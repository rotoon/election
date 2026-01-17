'use client'

import { SidebarLayout } from '@/components/shared/sidebar-layout'
import { useAuthStore } from '@/store/useAuthStore'
import { LayoutDashboard, Map, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { setUser } = useAuthStore()

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
    <SidebarLayout
      title='Admin Panel'
      subtitle='ระบบเลือกตั้งออนไลน์'
      variant='admin'
      navItems={navItems}
      onLogout={handleLogout}
    >
      {children}
    </SidebarLayout>
  )
}
