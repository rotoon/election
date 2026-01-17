'use client'

import VoterLayout from '@/components/shared/voter-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useCandidates,
  useConstituencyStatus,
  useMyVote,
  useVoteMutation,
} from '@/hooks/use-election'
import { useAuthStore } from '@/store/useAuthStore'
import { CheckCircle2, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function VotePage() {
  const { user, isAuthenticated } = useAuthStore()
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null,
  )

  // Queries
  const { data: constituency, isLoading: loadingConst } = useConstituencyStatus(
    user?.constituency_id,
  )
  const { data: candidates, isLoading: loadingCand } = useCandidates(
    user?.constituency_id?.toString(),
  )
  const { data: currentVote, isLoading: loadingVote } = useMyVote(user?.id)

  // Mutation
  const voteMutation = useVoteMutation()

  const pollOpen = constituency?.is_poll_open
  const isLoading = loadingConst || loadingCand || loadingVote

  function handleVote() {
    if (!pollOpen) return toast.error('หีบเลือกตั้งปิดแล้ว ไม่สามารถลงคะแนนได้')
    if (!selectedCandidate) return toast.error('กรุณาเลือกผู้สมัคร')
    if (!user?.constituency_id || !user.id) return

    voteMutation.mutate({
      userId: user.id,
      candidateId: selectedCandidate,
      constituencyId: user.constituency_id,
    })
  }

  // Effect to pre-select candidate if user has voted
  useEffect(() => {
    if (currentVote && currentVote.candidate_id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCandidate(currentVote.candidate_id)
    }
  }, [currentVote])

  console.log(candidates)

  if (!isAuthenticated || !user) {
    return (
      <VoterLayout>
        <div className='text-center py-20'>
          <h1 className='text-2xl font-bold mb-4'>
            กรุณาเข้าสู่ระบบเพื่อใช้สิทธิ
          </h1>
          <Link href='/auth'>
            <Button>เข้าสู่ระบบ</Button>
          </Link>
        </div>
      </VoterLayout>
    )
  }

  if (isLoading) {
    return (
      <VoterLayout>
        <div className='flex h-[50vh] items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </VoterLayout>
    )
  }

  return (
    <VoterLayout>
      <div className='space-y-8'>
        <div className='flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100'>
          <div>
            <h1 className='text-2xl font-bold text-slate-800'>คูหาเลือกตั้ง</h1>
            <p className='text-slate-500'>
              เขตเลือกตั้งที่ {user.constituency_id}
            </p>
          </div>
          <div className='mt-4 md:mt-0'>
            {pollOpen ? (
              <span className='px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold flex items-center'>
                <span className='w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse'></span>
                หีบเปิดอยู่ (Vote Open)
              </span>
            ) : (
              <span className='px-4 py-2 rounded-full bg-red-100 text-red-700 font-bold flex items-center'>
                <span className='w-2 h-2 bg-red-500 rounded-full mr-2'></span>
                หีบปิดแล้ว (Vote Closed)
              </span>
            )}
          </div>
        </div>

        {/* Can vote info */}
        {currentVote && (
          <div className='bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center text-blue-800'>
            <CheckCircle2 className='w-5 h-5 mr-3' />
            คุณได้ลงคะแนนให้{' '}
            <strong>
              หมายเลข{' '}
              {
                candidates?.find((c) => c.id === currentVote.candidate_id)
                  ?.candidate_number
              }
            </strong>{' '}
            แล้ว
            {pollOpen && ' (สามารถเปลี่ยนได้)'}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {candidates?.map((c) => {
            const isSelected = selectedCandidate === c.id
            return (
              <Card
                key={c.id}
                className={`cursor-pointer transition-all border-2 relative overflow-hidden group hover:shadow-lg
                            ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/50 shadow-md transform scale-[1.02]'
                                : 'border-slate-200 hover:border-blue-300'
                            }
                        `}
                onClick={() => pollOpen && setSelectedCandidate(c.id)}
              >
                {isSelected && (
                  <div className='absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full z-10'>
                    <CheckCircle2 className='w-5 h-5' />
                  </div>
                )}
                <div className='aspect-[4/3] bg-slate-100 relative'>
                  {c.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image_url}
                      alt='Candidate'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-slate-200 text-slate-400'>
                      <User className='w-16 h-16' />
                    </div>
                  )}
                  <div className='absolute top-0 left-0 bg-blue-600 text-white px-4 py-2 text-xl font-bold rounded-br-xl shadow-sm'>
                    เบอร์ {c.candidate_number}
                  </div>
                </div>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-xl'>
                    {c.first_name} {c.last_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center space-x-3 bg-white p-2 rounded border'>
                    {c.party?.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.party.logo_url}
                        alt='Party'
                        className='w-8 h-8 object-contain'
                      />
                    )}
                    <span className='font-medium text-slate-700'>
                      {c.party?.name || 'อิสระ'}
                    </span>
                  </div>
                  {c.personal_policy && (
                    <p className='text-sm text-slate-600 line-clamp-2 italic'>
                      &quot;{c.personal_policy}&quot;
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Sticky Action Footer for Mobile */}
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-center shadow-lg md:hidden z-20'>
          <Button
            size='lg'
            className='w-full max-w-sm text-lg shadow-xl'
            onClick={handleVote}
            disabled={!pollOpen || !selectedCandidate || voteMutation.isPending}
          >
            {voteMutation.isPending
              ? 'กำลังบันทึก...'
              : currentVote
                ? 'เปลี่ยนคะแนนโหวต'
                : 'ยืนยันการลงคะแนน'}
          </Button>
        </div>

        {/* Desktop Action Button */}
        <div className='hidden md:flex justify-end pb-10'>
          <Button
            size='lg'
            className='text-lg px-12 py-6 shadow-xl'
            onClick={handleVote}
            disabled={!pollOpen || !selectedCandidate || voteMutation.isPending}
          >
            {voteMutation.isPending
              ? 'กำลังบันทึก...'
              : currentVote
                ? 'เปลี่ยนคะแนนโหวต'
                : 'ยืนยันการลงคะแนน'}
          </Button>
        </div>
      </div>
    </VoterLayout>
  )
}
