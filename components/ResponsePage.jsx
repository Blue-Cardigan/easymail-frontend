"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ResponsePage({ campaignId, initialResponse, mpEmail, isGenerating }) {
  const [response, setResponse] = useState(initialResponse)
  const [copied, setCopied] = useState(false)
  const [mailtoLink, setMailtoLink] = useState('')

  useEffect(() => {
    setResponse(initialResponse)
    console.log('Result:', initialResponse)
  }, [initialResponse])

  useEffect(() => {
    if (response) {
      const subject = encodeURIComponent(`Regarding Campaign ${campaignId}`)
      const body = encodeURIComponent(response)
      setMailtoLink(`mailto:${mpEmail || ''}?subject=${subject}&body=${body}`)
    }
  }, [response, campaignId, mpEmail])

  const handleCopyText = () => {
    if (response) {
      navigator.clipboard.writeText(response).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Generated Letter - Campaign {campaignId}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="font-semibold mb-2">Option 1: Copy and paste the letter</p>
            <div 
              className="relative cursor-pointer"
              onClick={handleCopyText}
            >
              <pre className="whitespace-pre-wrap p-4 bg-gray-100 rounded-md min-h-[200px] flex items-center justify-center">
                {isGenerating ? (
                  <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
                ) : response ? (
                  response
                ) : (
                  "No response received yet."
                )}
              </pre>
              {copied && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-md">
                  Copied!
                </div>
              )}
            </div>
          </div>
          
          {mpEmail && (
            <p>Send the letter to your MP at: <strong>{mpEmail}</strong></p>
          )}
          
          <div>
            <p className="font-semibold mb-2">Option 2: Open in your email client</p>
            {response ? (
              <Button 
                asChild
                className="w-full"
                variant="outline"
              >
                <a href={mailtoLink}>
                  Click here to open your email client with the letter pre-filled
                </a>
              </Button>
            ) : (
              <p>Email link will be available once the letter is generated.</p>
            )}
          </div>
          
          <div className="p-4 bg-yellow-100 rounded-md">
            <p className="font-semibold mb-2">Important:</p>
            <ul className="list-disc list-inside">
              <li>Add your name at the bottom of the letter where it says "[Your Name]".</li>
              <li>Review the letter and make any personal adjustments if needed.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}