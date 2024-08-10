"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert } from "@/components/ui/alert"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import Image from 'next/image'

const loadingMessages = [
  "Generating your letter...",
  "Hold on a sec...",
  "We're almost there...",
  "We're sorry, something went wrong. Try reloading the page then try again."
]

export default function ResponsePage({ campaignId, campaignName, initialResponse, initialSubject, mpEmail, isGenerating: initialIsGenerating, error: initialError, onRetry, user: initialUser }) {
  const [response, setResponse] = useState(initialResponse)
  const [editableResponse, setEditableResponse] = useState(initialResponse)
  const [subject, setSubject] = useState(initialSubject)
  const [editableSubject, setEditableSubject] = useState(initialSubject)
  const [copied, setCopied] = useState(false)
  const [mailtoLink, setMailtoLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(initialIsGenerating)
  const [error, setError] = useState(initialError)
  const [retryCount, setRetryCount] = useState(0)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [contentHeight, setContentHeight] = useState('auto')
  const contentRef = useRef(null)
  const [originalResponse, setOriginalResponse] = useState(initialResponse)
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialUser)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSentMessage, setEmailSentMessage] = useState(null)
  const [hasEdited, setHasEdited] = useState(false)
  const [hasBrackets, setHasBrackets] = useState(false)
  const [user, setUser] = useState(initialUser)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      localStorage.setItem('hasEdited', JSON.stringify(hasEdited));
    }
  }, [hasEdited, user]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoggedIn(!!user)

      if (user) {
        const savedHasEdited = localStorage.getItem('hasEdited');
        if (savedHasEdited !== null) {
          setHasEdited(JSON.parse(savedHasEdited));
        }

        // Check for pending letter data (for users who just logged in)
        const pendingLetter = JSON.parse(localStorage.getItem('pendingLetter'))
        if (pendingLetter && pendingLetter.campaignId === campaignId) {
          setHasEdited(pendingLetter.hasEdited || false)
          setResponse(pendingLetter.generatedResponse || initialResponse)
          setEditableResponse(pendingLetter.generatedResponse || initialResponse)
          setSubject(pendingLetter.generatedSubject || initialSubject)
          setEditableSubject(pendingLetter.generatedSubject || initialSubject)
          
          // Clear the pendingLetter from localStorage
          localStorage.removeItem('pendingLetter')
        }
      } else {
        // If user is not logged in, clear the hasEdited state in localStorage
        localStorage.removeItem('hasEdited');
      }
    }
    checkLoginStatus()
  }, [supabase.auth, campaignId, initialResponse, initialSubject])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsLoggedIn(false)
  }

  const handleGoogleLogin = async () => {
    try {
      // Store necessary information in localStorage
      localStorage.setItem('pendingLetter', JSON.stringify({
        campaignId,
        campaignName,
        mpEmail,
        isGenerating: isGenerating,
        generatedResponse: response,
        generatedSubject: subject,
        hasEdited: hasEdited,
        formData: JSON.parse(localStorage.getItem('formData'))
      }))

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/gmail.send',
          redirectTo: `${window.location.origin}/auth/callback?returnTo=/${campaignId}`
        }
      })
      if (error) throw error
    } catch (error) {
      setError('Failed to initiate Google login. Please try again.')
    }
  }

  const handleSendEmail = async () => {
    setIsSendingEmail(true)
    setError(null)
    setEmailSentMessage(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Not logged in')
      }

      const response = await fetch(`/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: mpEmail,
          subject: editableSubject || subject,
          body: editableResponse || response,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      setEmailSentMessage('Email sent successfully!')
    } catch (error) {
      setError('Failed to send email. Please try again or use your email client.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleRetry = useCallback(async () => {
    if (retryCount < 3) {
      setIsGenerating(true)
      setError(null)
      setLoadingMessageIndex(retryCount)
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
      setOriginalResponse(initialResponse)
      setSubject(initialSubject)
      setEditableSubject(initialSubject)
      setRetryCount(0)
      setLoadingMessageIndex(0)
    }
  }, [initialResponse, initialSubject, initialError, initialIsGenerating])

  useEffect(() => {
    if (isGenerating) {
      const timer = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % (loadingMessages.length - 1))
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [isGenerating])

  useEffect(() => {
    if (contentRef.current && !isEditing && response) {
      setContentHeight(`${contentRef.current.scrollHeight}px`)
    }
  }, [response, isEditing])

  useEffect(() => {
    if (response && subject && mpEmail) {
      const encodedSubject = encodeURIComponent(subject)
      const body = encodeURIComponent(response)
      setMailtoLink(`mailto:${mpEmail}?subject=${encodedSubject}&body=${body}`)
    }
  }, [response, subject, mpEmail])

  const handleCopyText = () => {
    if ((isEditing ? editableResponse : response) && !error) {
      navigator.clipboard.writeText(isEditing ? editableResponse : response).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const checkForBrackets = (text) => {
    return /\[.*?\]/.test(text)
  }

  const handleEditToggle = () => {
    if (isEditing) {
      if (editableResponse !== response) {
        setResponse(editableResponse)
        setHasEdited(true)
      }
      if (editableSubject !== subject) {
        setSubject(editableSubject)
        setHasEdited(true)
      }
      setHasBrackets(checkForBrackets(editableResponse) || checkForBrackets(editableSubject))
    }
    setIsEditing(!isEditing)
  }

  const handleEditableResponseChange = (e) => {
    const newText = e.target.value
    setEditableResponse(newText)
    if (!hasEdited && newText !== response) {
      setHasEdited(true)
    }
    setHasBrackets(checkForBrackets(newText))
  }

  const handleResetToOriginal = () => {
    setEditableResponse(originalResponse)
    setEditableSubject(initialSubject)
    setHasEdited(false)
    setHasBrackets(checkForBrackets(originalResponse) || checkForBrackets(initialSubject))
  }

  const renderContent = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
          <p className="text-center mb-2">{loadingMessages[loadingMessageIndex]}</p>
          {retryCount > 0 && retryCount < 3 && (
            <p className="text-sm text-gray-500">
              Retry attempt {retryCount}/3
            </p>
          )}
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
      return (
        <div className="relative">
          <div 
            ref={contentRef}
            className={`cursor-pointer ${isEditing ? 'hidden' : ''}`}
            onClick={handleCopyText}
          >
            <h3 className="font-bold mb-2">{subject}</h3>
            <div>{response}</div>
          </div>
          {isEditing && (
            <>
              <input
                value={editableSubject}
                onChange={(e) => setEditableSubject(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
                placeholder="Subject"
              />
              <Textarea
                value={editableResponse}
                onChange={handleEditableResponseChange}
                className={`min-h-[200px] w-full mb-2 ${hasBrackets ? 'border-red-500' : ''}`}
                style={{ height: contentHeight }}
              />
            </>
          )}
          {copied && !isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-md">
              Copied!
            </div>
          )}
        </div>
      )
    } else {
      return "No response received yet."
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto relative">
        {user && (
          <div className="absolute top-2 right-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-50">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Logged in</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    Log out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
        <CardHeader>
          <CardTitle>Your Generated Letter - {campaignName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isLoggedIn && (
            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Tip:</strong> {response ? (
                  "Log in to send your email directly from this page:"
                ) : (
                  "Log in now to send your email directly once it's ready:"
                )}
              </p>
              <GoogleSignInButton onClick={handleGoogleLogin} />
            </div>
          )}
          
          <div>
            <div className="relative">
              <pre className="whitespace-pre-wrap p-4 bg-gray-100 rounded-md">
                {renderContent()}
              </pre>
            </div>
            <div className="mt-2 flex items-center justify-between">
              {isEditing && (
                <Button onClick={handleResetToOriginal} variant="outline" size="sm">
                  Reset to Original
                </Button>
              )}
              <div className="flex items-center space-x-2">
                <Switch id="edit-mode" checked={isEditing} onCheckedChange={handleEditToggle} />
                <Label htmlFor="edit-mode" className="text-sm">
                  {isEditing ? 'Save Changes' : 'Click to edit'}
                </Label>
              </div>
            </div>
            {hasBrackets && (
              <Alert variant="destructive" className="mt-2">
                Make sure to fill in the [Placeholder Text] before sending.
              </Alert>
            )}
          </div>
          
          {response && !error && hasEdited && (
            <div>
              <p className="font-semibold mb-2">
                          
              {mpEmail && !error && (
                <p>Send the letter to your MP: <strong>{mpEmail}</strong></p>
              )}
              </p>
              {isLoggedIn ? (
                <Button 
                  onClick={handleSendEmail}
                  className="w-full mb-2 flex items-center justify-center gap-2"
                  disabled={isSendingEmail || hasBrackets}
                >
                  {isSendingEmail ? (
                    'Sending...'
                  ) : (
                    <>
                      Send with{' '}
                      <Image
                        src="/signin-assets/Web (mobile + desktop)/svg/dark/web_dark_rd_na.svg"
                        alt="Google logo"
                        width={20}
                        height={20}
                      />
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleGoogleLogin}
                  className="w-full mb-2 flex items-center justify-center gap-2"
                  disabled={hasBrackets}
                >
                  Send with{' '}
                  <Image
                    src="/signin-assets/Web (mobile + desktop)/svg/dark/web_dark_rd_na.svg"
                    alt="Google logo"
                    width={20}
                    height={20}
                  />
                </Button>
              )}
              <Button 
                asChild
                className="w-full"
                variant="outline"
                disabled={hasBrackets}
              >
                <a href={mailtoLink}>
                  Open in your email client
                </a>
              </Button>
            </div>
          )}
          
          {emailSentMessage && (
            <Alert variant="success" className="mt-4">{emailSentMessage}</Alert>
          )}
          
          {!error && (
            <div className="p-4 bg-yellow-100 rounded-md">
              <p className="font-semibold mb-2">Important:</p>
              <ul className="list-disc list-inside">
                <li>Review the letter and make any personal adjustments if needed.</li>
                {!hasBrackets && (
                  <li>Add your name at the bottom of the letter.</li>
                )}
                {!hasEdited && (
                  <li className="text-red-600">You must edit the letter before sending it.</li>
                )}
                {hasBrackets && (
                  <li className="text-red-600">Add your name at the bottom of the letter where it says "[Your Name]".</li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}