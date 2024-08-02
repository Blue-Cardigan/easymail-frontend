"use client"

import { useSearchParams } from 'next/navigation'
import ClientResponse from '@/components/ClientResponse'

export default function ShareCampaignPage({ params }) {
  const searchParams = useSearchParams()
  const url = `easymail.com/${searchParams.get('url')}`

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <ClientResponse campaignId={params.id} shareableUrl={url} />
    </div>
  )
}