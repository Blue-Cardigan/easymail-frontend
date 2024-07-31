"use client"

import { useState } from 'react'
import DesignCampaign from '@/components/DesignCampaign'
import { useRouter } from 'next/navigation'

export default function CampaignDesignPage({ params }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const defaultCampaignData = {
    campaign_name: '',
    name: '',
    campaign_objectives: '',
    evidence_data: '',
    current_status: '',
    desired_response: '',
    local_relevance: '',
    docs: []
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
        body: JSON.stringify({ ...formData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update campaign')
      }

      const result = await response.json()
      console.log('Campaign updated successfully. New campaign ID:', result)
      router.push(`/admin/${params.id}/share`)
    } catch (error) {
      console.error('Error updating campaign:', error)
      setError('Failed to update campaign. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <DesignCampaign 
        campaignId={params.id} 
        initialData={defaultCampaignData} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}