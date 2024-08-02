"use client"

import { useState, useEffect } from 'react'
import DesignCampaign from '@/components/DesignCampaign'
import { useRouter } from 'next/navigation'

const CACHE_KEY = 'campaignFormData'

export default function CampaignDesignPage({ params }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const defaultCampaignData = {
    campaign_name: '',
    short_description: '',
    long_description: '',
    docs: []
  }

  const [formData, setFormData] = useState(defaultCampaignData)

  // Load cached form data on component mount
  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY)
    if (cachedData) {
      setFormData(JSON.parse(cachedData))
    }
  }, [])

  // Update cache whenever form data changes
  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(formData))
  }, [formData])

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
      router.push(`/admin/${campaignID}/share?url=${url}`)
    } catch (error) {
      console.error('Error in campaign process:', error)
      setError(`Failed to process campaign: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
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