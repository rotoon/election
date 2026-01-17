'use client'

import { SidebarLayout } from '@/components/shared/sidebar-layout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { Flag, LayoutDashboard, Settings2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ECLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, setUser } = useAuthStore()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore error if logout fails
    }
    setUser(null)
    router.push('/auth')
  }

  // Basic role check
  useEffect(() => {
    // In real app, strict check here
  }, [user, router])

  const navItems = [
    { href: '/ec/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
    { href: '/ec/parties', label: 'จัดการพรรคการเมือง', icon: Flag },
    { href: '/ec/candidates', label: 'จัดการผู้สมัคร', icon: Users },
    { href: '/ec/control', label: 'ควบคุมการเลือกตั้ง', icon: Settings2 },
  ]

  return (
    <SidebarLayout
      title='EC Panel'
      subtitle='คณะกรรมการการเลือกตั้ง'
      variant='ec'
      navItems={navItems}
      onLogout={handleLogout}
    >
      {children}
    </SidebarLayout>
  )
}
