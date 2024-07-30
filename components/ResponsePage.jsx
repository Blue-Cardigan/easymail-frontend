"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ResponsePage({ campaignId, initialResponse }) {
  const [response, setResponse] = useState(initialResponse)
  const [copied, setCopied] = useState(false)
  const [mailtoLink, setMailtoLink] = useState('')

  useEffect(() => {
    if (response && !response.letter) {
      const fetchLetter = async () => {
        try {
          const res = await fetch(`/api/campaign/${campaignId}/response?id=${response.id}`)
          if (!res.ok) throw new Error('Failed to fetch letter')
          const data = await res.json()
          setResponse(data)
        } catch (error) {
          console.error('Error fetching letter:', error)
        }
      }
      fetchLetter()
    }
  }, [response, campaignId])

  useEffect(() => {
    if (response && response.letter) {
      const subject = encodeURIComponent(`Regarding Campaign ${campaignId}`)
      const body = encodeURIComponent(response.letter)
      setMailtoLink(`mailto:${response.mpEmail}?subject=${subject}&body=${body}`)
    }
  }, [response, campaignId])

  const handleCopyText = () => {
    if (response && response.letter) {
      navigator.clipboard.writeText(response.letter).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  if (!response) return <div>No response found</div>

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Generated Letter - Campaign {campaignId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="relative cursor-pointer mb-4"
            onClick={handleCopyText}
          >
            <pre className="whitespace-pre-wrap p-4 bg-gray-100 rounded-md min-h-[200px] flex items-center justify-center">
              {!response.letter ? (
                <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
              ) : (
                response.letter
              )}
            </pre>
            {copied && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-md">
                Copied!
              </div>
            )}
          </div>
          <div className="text-sm">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click on the text above to copy the letter{!response.letter && " once it's generated"}.</li>
              <li>
                {response.letter ? (
                  <>
                    Click <a href={mailtoLink} className="text-blue-600 hover:underline">here</a> to open your email client with the letter pre-filled, or manually email your MP at: <strong>{response.mpEmail}</strong>
                  </>
                ) : (
                  <>Email your MP at: <strong>{response.mpEmail}</strong></>
                )}
              </li>
              <li>Add your name at the bottom of the letter where it says "[Your Name]".</li>
              <li>Review the letter, make any personal adjustments if needed, then send it to your MP.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}