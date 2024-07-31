'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConstituentForm } from '@/components/ConstituentForm'

async function getCampaignDetails(id) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log(`Fetching campaign details for id: ${id}`)
  const res = await fetch(`${supabaseUrl}/functions/v1/retrieveCampaign/${id}`, {
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Failed to fetch campaign details: ${res.status} ${errorText}`)
    throw new Error(`Failed to fetch campaign details: ${res.status} ${errorText}`)
  }

  return res.json()
}

export default function LetterGeneratorPage({ params }) {
  const [campaignData, setCampaignData] = useState(null)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useState(async () => {
    try {
      const data = await getCampaignDetails(params.id)
      setCampaignData(data)
    } catch (err) {
      console.error('Error fetching campaign details:', err)
      setError(err.message)
    }
  }, [params.id])

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generateLetter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          campaignID: params.id,
          formData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate letter')
      }

      const result = await response.json()
      router.push(`/result/${result.id}`)
    } catch (error) {
      console.error('Error generating letter:', error)
      setError('Failed to generate letter. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!campaignData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Generate Letter for Campaign: {campaignData.campaign_name}</h1>
      <ConstituentForm 
        campaignId={params.id} 
        campaignData={campaignData} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}