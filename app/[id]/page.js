'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ConstituentForm } from '@/components/ConstituentForm'
import ResponsePage from '@/components/ResponsePage'
import CampaignNotFound from './not-found'

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
  const [formData, setFormData] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchCampaignDetails() {
      try {
        const data = await getCampaignDetails(params.id)
        if (data) {
          setCampaignData(data)
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.error('Error fetching campaign details:', err)
        // Set notFound to true for any error, including 400 Bad Request
        setNotFound(true)
        setError(err.message)
      }
    }
    fetchCampaignDetails()
  }, [params.id])

  const generateLetter = useCallback(async (formData) => {
    if (!formData) return

    setIsGenerating(true)
    setError(null)
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
        const errorText = await response.text()
        throw new Error(`Failed to generate letter: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      setGeneratedResponse(result.letter)
    } catch (error) {
      console.error('Error generating letter:', error)
      setError(error.message || 'Failed to generate letter. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [params.id])

  const handleSubmit = async (submittedFormData) => {
    setIsSubmitting(true)
    setMpEmail(submittedFormData.mpEmail)
    setFormData(submittedFormData)
    console.log('Campaign ID:', params.id)
    console.log('Form Data:', submittedFormData)
    await generateLetter(submittedFormData)
    setIsSubmitting(false)
  }

  if (notFound) {
    return <CampaignNotFound />
  }

  if (!campaignData && !error) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {campaignData ? (
        (isGenerating || generatedResponse || error) ? (
          <ResponsePage 
            campaignId={params.id}
            campaignName={campaignData.campaign_name}
            initialResponse={generatedResponse} 
            mpEmail={mpEmail} 
            isGenerating={isGenerating}
            error={error}
            onRetry={() => generateLetter(formData)}
          />
        ) : (
          <ConstituentForm 
            campaignId={params.id} 
            campaignData={campaignData} 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )
      ) : error ? (
        <div>Error: {error}</div>
      ) : null}
    </div>
  )
}