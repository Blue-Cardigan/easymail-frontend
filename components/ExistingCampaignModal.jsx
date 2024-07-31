'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ExistingCampaignModal({ onClose }) {
  const [campaignId, setCampaignId] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id')
        .eq('id', campaignId)
        .single()

      if (error) throw error

      if (data) {
        router.push(`/${campaignId}`)
      } else {
        setError('Campaign not found')
      }
    } catch (error) {
      console.error('Error checking campaign:', error)
      setError('Error checking campaign. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Enter Existing Campaign ID</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Campaign ID"
            className="border p-2 mb-4 w-full"
            required
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {isLoading ? 'Checking...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}