"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const loadingMessages = [
  "Generating your letter...",
  "Hold on a sec...",
  "We're almost there...",
  "We're sorry, something went wrong. Try reloading the page then try again."
]

export default function ResponsePage({ campaignId, campaignName, initialResponse, mpEmail, isGenerating: initialIsGenerating, error: initialError, onRetry }) {
  const [response, setResponse] = useState(initialResponse)
  const [editableResponse, setEditableResponse] = useState(initialResponse)
  const [copied, setCopied] = useState(false)
  const [mailtoLink, setMailtoLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(initialIsGenerating)
  const [error, setError] = useState(initialError)
  const [retryCount, setRetryCount] = useState(0)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  const handleRetry = useCallback(async () => {
    if (retryCount < 3) {
      setIsGenerating(true)
      setError(null)
      setLoadingMessageIndex(0)
      try {
        await onRetry()
        setRetryCount(prev => prev + 1)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsGenerating(false)
      }
    }
  }, [retryCount, onRetry])

  useEffect(() => {
    if (initialError && retryCount < 3) {
      handleRetry()
    }
  }, [initialError, retryCount, handleRetry])

  useEffect(() => {
    setIsGenerating(initialIsGenerating)
    setError(initialError)
    if (!initialError && initialResponse) {
      setResponse(initialResponse)
      setEditableResponse(initialResponse)
      setRetryCount(0)
      setLoadingMessageIndex(0)
      console.log('Result:', initialResponse)
    }
  }, [initialResponse, initialError, initialIsGenerating])

  useEffect(() => {
    if (isGenerating) {
      const timer = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % (loadingMessages.length - 1))
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [isGenerating])

  useEffect(() => {
    if (response) {
      const subject = encodeURIComponent(`Regarding Campaign ${campaignId}`)
      const body = encodeURIComponent(isEditing ? editableResponse : response)
      setMailtoLink(`mailto:${mpEmail || ''}?subject=${subject}&body=${body}`)
    }
  }, [response, editableResponse, isEditing, campaignId, mpEmail])

  const handleCopyText = () => {
    if ((isEditing ? editableResponse : response) && !error) {
      navigator.clipboard.writeText(isEditing ? editableResponse : response).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const renderContent = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
          <p className="text-center">{loadingMessages[loadingMessageIndex]}</p>
        </div>
      )
    } else if (error) {
      return (
        <div className="text-red-500">
          {retryCount >= 3 ? loadingMessages[loadingMessages.length - 1] : error}
          {retryCount > 0 && retryCount < 3 && (
            <span className="block mt-2 text-sm">
              Failed attempts: {retryCount}/3
            </span>
          )}
        </div>
      )
    } else if (response) {
      return isEditing ? (
        <Textarea
          value={editableResponse}
          onChange={(e) => setEditableResponse(e.target.value)}
          className="min-h-[200px] w-full"
        />
      ) : (
        response
      )
    } else {
      return "No response received yet."
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Generated Letter - {campaignName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Your letter</p>
            {response && !error && (
              <div className="flex items-center space-x-2">
                <Switch id="edit-mode" checked={isEditing} onCheckedChange={handleEditToggle} />
                <Label htmlFor="edit-mode">{isEditing ? 'Editing' : 'Click to edit'}</Label>
              </div>
            )}
          </div>
          <div className="relative">
            {(error || isGenerating) && retryCount > 0 && retryCount < 3 && (
              <span className="absolute top-0 right-0 text-xs text-gray-500">
                Retry attempt {retryCount}/3
              </span>
            )}
            <div 
              className={`relative ${!error && response && !isEditing ? 'cursor-pointer' : ''}`}
              onClick={!isEditing ? handleCopyText : undefined}
            >
              <pre className={`whitespace-pre-wrap p-4 bg-gray-100 rounded-md min-h-[200px] ${isEditing ? '' : 'flex items-center justify-center'}`}>
                {renderContent()}
              </pre>
              {copied && !isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-md">
                  Copied!
                </div>
              )}
            </div>
          </div>
          
          {mpEmail && !error && (
            <p>Send the letter to your MP at: <strong>{mpEmail}</strong></p>
          )}
          
          <div>
            <p className="font-semibold mb-2">Open in your email client</p>
            {response && !error ? (
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
          
          {!error && (
            <div className="p-4 bg-yellow-100 rounded-md">
              <p className="font-semibold mb-2">Important:</p>
              <ul className="list-disc list-inside">
                <li>Add your name at the bottom of the letter where it says "[Your Name]".</li>
                <li>Review the letter and make any personal adjustments if needed.</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}