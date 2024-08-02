'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConstituentForm } from '@/components/ConstituentForm'
import ResponsePage from '@/components/ResponsePage'

async function getCampaignDetails(id) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const res = await fetch(`${supabaseUrl}/functions/v1/retrieveCampaign/${id}`, {
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    }
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResponse, setGeneratedResponse] = useState(null)
  const [mpEmail, setMpEmail] = useState(null)
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
    setIsGenerating(true)
    setMpEmail(formData.mpEmail)
    console.log('Campaign ID:', params.id)
    console.log('Form Data:', formData)
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
      setGeneratedResponse(result.letter)
    } catch (error) {
      console.error('Error generating letter:', error)
      setError('Failed to generate letter. Please try again.')
    } finally {
      setIsSubmitting(false)
      setIsGenerating(false)
    }
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!campaignData) {
    return <div>Loading...</div>
  }

  if (isGenerating || generatedResponse) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <ResponsePage 
          campaignId={params.id} 
          initialResponse={generatedResponse} 
          mpEmail={mpEmail} 
          isGenerating={isGenerating}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <ConstituentForm 
        campaignId={params.id} 
        campaignData={campaignData} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}