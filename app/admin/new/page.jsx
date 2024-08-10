"use client"

import { useState, useEffect } from 'react'
import DesignCampaign from '@/components/DesignCampaign'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const CACHE_KEY = 'campaignFormData'

export default function CampaignDesignPage({ params }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const defaultCampaignData = {
    campaign_name: '',
    short_description: '',
    long_description: '',
    docs: []
  }

  const [formData, setFormData] = useState(defaultCampaignData)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      }
    }

    checkSession()

    const cachedData = localStorage.getItem(CACHE_KEY)
    if (cachedData) {
      setFormData(JSON.parse(cachedData))
    }
  }, [router, supabase])

  // Update cache whenever form data changes
  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(formData))
  }, [formData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleFormChange = (updatedData) => {
    setFormData(updatedData)
  }

  const handleSubmit = async (submittedFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // First API call to update campaign
      const updateResponse = await fetch(`${supabaseUrl}/functions/v1/updateCampaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ ...submittedFormData }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update campaign')
      }

      const responseData = await updateResponse.json();
      const campaignID = responseData[0].id;

      // Second API call to make URL
      const makeUrlResponse = await fetch(`${supabaseUrl}/functions/v1/makeURL`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ campaignID }),
      })

      if (!makeUrlResponse.ok) {
        throw new Error('Failed to generate URL')
      }

      const urlResponse = await makeUrlResponse.json();
      const url = urlResponse.url;

      // Clear the cache after successful submission
      localStorage.removeItem(CACHE_KEY)

      // Navigate to share page with the generated URL
      router.push(`/admin/share/${url}`)
    } catch (error) {
      console.error('Error in campaign process:', error)
      setError(`Failed to process campaign: ${error.message}`)
      
      // If the error is due to an invalid route or unauthorized access, show the not-found page
      if (error.message.includes('404') || error.message.includes('401')) {
        notFound()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end mb-4">
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <DesignCampaign 
        campaignID={params.id} 
        initialData={formData} 
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}