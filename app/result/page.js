'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ResponsePage from '@/components/ResponsePage'

const POLLING_INTERVAL = 1000 // 1 second

export default function ResponsePageWrapper({ params, searchParams }) {
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const responseId = params.responseId

  useEffect(() => {
    if (!responseId) {
      setError('No response ID provided')
      setIsLoading(false)
      return
    }

    let pollingInterval

    const fetchLetter = async () => {
      try {
        const data = {
          letterStatus: Math.random() > 0.7 ? 'complete' : 'processing',
          letter: 'This is a generated letter...',
        }
        // const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/requestLetter/${responseId}`, {
        //   headers: {
        //     'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        //   }
        // })

        // if (!res.ok) {
        //   throw new Error('Failed to fetch letter')
        // }
        
        // const data = await res.json()

        if (data.letter) {
          setResponse(data)
          setIsLoading(false)
          clearInterval(pollingInterval)
        }
      } catch (err) {
        console.error('Error fetching letter:', err)
        setError('Failed to fetch letter. Please try again later.')
        setIsLoading(false)
        clearInterval(pollingInterval)
      }
    }

    fetchLetter() // Initial fetch

    pollingInterval = setInterval(fetchLetter, POLLING_INTERVAL)

    return () => clearInterval(pollingInterval) // Cleanup on unmount
  }, [responseId])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (isLoading) {
    return <div>Loading letter...</div>
  }

  if (!response) {
    return <div>No response found</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <ResponsePage campaignId={params.id} initialResponse={response} />
    </div>
  )
}