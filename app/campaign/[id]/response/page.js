"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ResponsePage({ params}) {
  const { id } = params
  const searchParams = useSearchParams()
  const [response, setResponse] = useState('')
  const [mpEmail, setMpEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      const formData = JSON.parse(decodeURIComponent(data))
      // Simulate API call
      setTimeout(() => {
        const generatedResponse = `Dear ${formData.mp},

This is a sample response from the server. Your letter has been generated successfully for ${formData.constituency} with the following tones: ${formData.tones.join(', ')}. Values: ${formData.valuemode}

[Your letter content will go here]

Sincerely,
[Your Name]`
        setResponse(generatedResponse)
        setMpEmail(formData.mpEmail)
        setIsLoading(false)
      }, 2000)
    }
  }, [searchParams])

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
          <CardTitle>Your Generated Letter - Campaign {id}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div 
                className="relative cursor-pointer mb-4"
                onClick={handleCopyText}
              >
                <pre className="whitespace-pre-wrap p-4 bg-gray-100 rounded-md">
                  {response}
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
                  <li>Click on the text above to copy the letter.</li>
                  <li>Paste the letter into an email to your MP: <strong>{mpEmail}</strong></li>
                  <li>Add your name at the bottom of the letter where it says "[Your Name]".</li>
                  <li>Review the letter, make any personal adjustments if needed, then send it to your MP.</li>
                </ol>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}