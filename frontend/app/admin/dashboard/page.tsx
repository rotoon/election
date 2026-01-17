'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminStats } from '@/hooks/use-election'
import { Map, Users, Vote } from 'lucide-react'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) {
    return <div>Loading...</div>
  }

  const statItems = [
    {
      label: 'ผู้ลงทะเบียนทั้งหมด',
      value: stats?.totalVoters.toLocaleString() || '0',
      icon: Users,
      desc: `+${stats?.voterChange}% จากเมื่อวาน`,
    },
    {
      label: 'จำนวนเขตเลือกตั้ง',
      value: stats?.totalConstituencies.toLocaleString() || '0',
      icon: Map,
      desc: 'ครอบคลุมทั่วประเทศ',
    },
    {
      label: 'กกต. ในระบบ',
      value: stats?.totalOfficers.toLocaleString() || '0',
      icon: Vote,
      desc: 'พร้อมปฏิบัติหน้าที่',
    },
  ]

  return (
    <div className='space-y-6'>
      <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
      <div className='grid gap-4 md:grid-cols-3'>
        {statItems.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {stat.label}
                </CardTitle>
                <Icon className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
                <p className='text-xs text-muted-foreground'>{stat.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activities or Quick Actions could go here */}
    </div>
  )
}
