"use client"

import ClientResponse from '@/components/ClientResponse'

export default function ShareCampaignPage({ params }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <ClientResponse campaignId={params.id} />
    </div>
  )
}