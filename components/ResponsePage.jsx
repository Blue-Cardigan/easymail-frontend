"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ResponsePage({ campaignId, initialResponse }) {
  const [response, setResponse] = useState(initialResponse)
  const [copied, setCopied] = useState(false)
  const [mailtoLink, setMailtoLink] = useState('')

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
            <div className="space-y-2">
              <p className="font-semibold">Option 1: Copy and paste the letter</p>
            </div>
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
          <li>Send the letter to your MP at: <strong>{response.mpEmail}</strong></li>
          <div className="text-sm space-y-4">
            <div className="space-y-2">
              <p className="font-semibold">Option 2: Open in your email client</p>
              {response.letter ? (
                <Button 
                  as="a" 
                  href={mailtoLink} 
                  className="w-full"
                  variant="outline"
                >
                  Click here to open your email client with the letter pre-filled
                </Button>
              ) : (
                <p>Email link will be available once the letter is generated.</p>
              )}
            </div>
            <div className="mt-4 p-2 bg-yellow-100 rounded-md">
              <p className="font-semibold">Important:</p>
              <ul className="list-disc list-inside">
                <li>Add your name at the bottom of the letter where it says "[Your Name]".</li>
                <li>Review the letter and make any personal adjustments if needed.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}