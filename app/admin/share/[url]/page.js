"use client"

import { useParams } from 'next/navigation'
import ClientResponse from '@/components/ClientResponse'

export default function ShareCampaignPage() {
  const params = useParams()
  const url = `easymail.civita.co.uk/${params.url}`

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <ClientResponse shareableUrl={url} />
    </div>
  )
}