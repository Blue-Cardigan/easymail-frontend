"use client"

import { useState } from 'react'
import CampaignPromptDesigner from '@/components/CampaignPromptDesigner'

export default function CampaignDesignPage({ params }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const defaultCampaignData = {
    campaign_name: '',
    name: '',
    campaign_objectives: '',
    evidence_data: '',
    current_status: '',
    desired_response: '',
    local_relevance: ''
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const response = await fetch(`${supabaseUrl}/functions/v1/updateCampaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ formData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update campaign')
      }

      const result = await response.json()
      console.log('Campaign updated successfully:', result)
      // Handle successful update (e.g., show success message, redirect)
    } catch (error) {
      console.error('Error updating campaign:', error)
      setError('Failed to update campaign. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Campaign ID: {params.id}</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <CampaignPromptDesigner 
        campaignId={params.id} 
        initialData={defaultCampaignData} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}