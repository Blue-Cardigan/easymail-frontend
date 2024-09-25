'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ConstituentForm } from '@/components/writing/EnterDetails'
import ResponsePage from '@/components/writing/SendLetter'
import CampaignNotFound from './not-found'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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
    console.error(`Failed to fetch campaign details: ${res.status} ${errorText}`);
    throw new Error(`Failed to fetch campaign details :(`);
  }

  return res.json()
}

export default function LetterGeneratorPage({ params }) {
  const [campaignData, setCampaignData] = useState(null)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResponse, setGeneratedResponse] = useState(null)
  const [generatedSubject, setGeneratedSubject] = useState(null)
  const [mpEmail, setMpEmail] = useState(null)
  const [formData, setFormData] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

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
        setNotFound(true)
        setError(err.message)
      }
    }
    fetchCampaignDetails()

    const isReturningFromLogin = searchParams.get('fromLogin') === 'true'
    if (isReturningFromLogin) {
      const pendingLetter = JSON.parse(localStorage.getItem('pendingLetter'))
      if (pendingLetter && pendingLetter.campaignId === params.id) {
        setMpEmail(pendingLetter.mpEmail)
        setGeneratedResponse(pendingLetter.generatedResponse)
        setGeneratedSubject(pendingLetter.generatedSubject)
        setFormData(JSON.parse(localStorage.getItem('formData')))
        
        localStorage.removeItem('pendingLetter')
        localStorage.removeItem('formData')
      }
    }
  }, [params.id, searchParams, supabase.auth])

  const generateLetter = useCallback(async (formData) => {
    if (!formData) return

    setIsLoading(true)
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
      setGeneratedSubject(result.subject_line)
    } catch (error) {
      console.error('Error generating letter:', error)
      setError(error.message || 'Failed to generate letter. Please try again.')
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }, [params.id])

  const handleSubmit = async (submittedFormData) => {
    setIsSubmitting(true)
    setMpEmail(submittedFormData.mpEmail)
    setFormData(submittedFormData)
    localStorage.setItem('formData', JSON.stringify(submittedFormData))
    await generateLetter(submittedFormData)
    setIsSubmitting(false)
  }

  const handleGoogleLogin = async () => {
    // Store the current state in localStorage
    localStorage.setItem('pendingLetter', JSON.stringify({
      campaignId: params.id,
      mpEmail,
      generatedResponse,
      generatedSubject
    }))
    localStorage.setItem('formData', JSON.stringify(formData))

    // Redirect to the Google login page
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(window.location.pathname)}`
      }
    })

    if (error) {
      console.error('Error during Google login:', error)
      setError('Failed to initiate Google login. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {campaignData ? (
        (generatedResponse || error) ? (
          <ResponsePage 
            campaignId={params.id}
            campaignName={campaignData.campaign_name}
            initialResponse={generatedResponse} 
            initialSubject={generatedSubject} 
            mpEmail={mpEmail} 
            isGenerating={isGenerating}
            isLoading={isLoading}
            error={error}
            onRetry={() => generateLetter(formData)}
            user={user}
            onGoogleLogin={handleGoogleLogin}
          />
        ) : (
          <ConstituentForm 
            campaignId={params.id} 
            campaignData={campaignData} 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            user={user}
          />
        )
      ) : error ? (
        <div>Error: {error}</div>
      ) : null}
    </div>
  )
}
