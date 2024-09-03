"use client"

import { useParams } from 'next/navigation'
import ShareCampaign from '@/components/management/ShareCampaign'
import Header from '@/components/Header'

export default function ShareCampaignPage() {
  const params = useParams()
  const url = `easymail.civita.co.uk/${params.url}`

  return (
    <>
      <Header></Header>
      <div className="container mx-auto p-4 min-h-screen bg-background flex flex-col items-center justify-center">
        <ShareCampaign shareableUrl={url} />
      </div>
    </>
  )
}