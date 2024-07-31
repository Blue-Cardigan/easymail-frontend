"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ClientResponse({ campaignId }) {
  const [copied, setCopied] = useState(false)
  const shareableLink = `easymail.com/${campaignId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Share Your Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Here's the link supporters can use to send a letter about your campaign:</p>
          <div 
            className="relative cursor-pointer"
            onClick={handleCopyLink}
          >
            <pre className="whitespace-pre-wrap p-4 bg-gray-100 rounded-md text-center">
              {shareableLink}
            </pre>
            {copied && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-md">
                Copied!
              </div>
            )}
          </div>
          <div className="mt-4 p-2 bg-yellow-100 rounded-md">
            <p className="font-semibold">Instructions:</p>
            <ul className="list-disc list-inside">
              <li>Share this link with supporters of your campaign via email, social media, or your website.</li>
              <li>When supporters visit this link, they'll be able to easily send a letter to their MP about your campaign.</li>
              <li>Encourage supporters to personalize their letters for maximum impact.</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}