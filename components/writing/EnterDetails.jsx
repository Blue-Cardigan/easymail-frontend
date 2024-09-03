"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import mpsData from '@/lib/mps.json'

const tones = [
  "Concerned",
  "Hopeful",
  "Determined",
  "Respectful",
  "Passionate",
  "Analytical",
  "Assertive",
  "Informative",
  "Optimistic",
  "Critical",
  "Pragmatic",
  "Diplomatic",
  "Inquisitive",
]

export function ConstituentForm({ campaignId, campaignData, onSubmit, isSubmitting }) {
  const [constituencySearch, setConstituencySearch] = useState('')
  const [selectedConstituency, setSelectedConstituency] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [age, setAge] = useState('')
  const [ageError, setAgeError] = useState('')
  const [selectedReasons, setSelectedReasons] = useState([])
  const [selectedTones, setSelectedTones] = useState([])
  const [selectedCustomCauses, setSelectedCustomCauses] = useState([])
  const [errors, setErrors] = useState({})
  const [user, setUser] = useState(null)
  const supabase = createClientComponentClient()

  const mpConstituencies = mpsData.map(mp => ({
    id: mp.Name,
    name: mp.Name,
    constituency: mp.Constituency,
    email: mp.Email,
    searchString: `${mp.Name} - ${mp.Constituency}`
  }))

  const reasons = {
    "Personal Impact": "This issue directly affects me or my loved ones.",
    "Community Concern": "I'm worried about how this impacts my local community.",
    "National Interest": "I believe this is crucial for the future of our country.",
    "Global Significance": "This issue has worldwide implications that concern me.",
    "Moral Imperative": "I feel a strong ethical obligation to support this cause.",
    "Economic Implications": "I'm concerned about the economic effects this issue may have.",
  }

  const customCauses = campaignData.causes ? 
    campaignData.causes.reduce((acc, cause) => {
      acc[cause.title] = cause.description;
      return acc;
    }, {}) : {}

  const handleConstituencySearch = (e) => {
    const value = e.target.value
    setConstituencySearch(value)
    setErrors(prev => ({ ...prev, constituency: '' }))

    if (value.length > 0) {
      const filteredSuggestions = mpConstituencies.filter(
        (mp) => mp.searchString.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filteredSuggestions)
    } else {
      setSuggestions([])
    }
  }

  const validateAge = (value) => {
    const ageNum = parseInt(value, 10)
    if (value === '') {
      setAgeError('')
    } else if (isNaN(ageNum) || ageNum < 12 || ageNum > 100) {
      setAgeError('Age must be between 12 and 100')
    } else {
      setAgeError('')
    }
  }

  const handleAgeChange = (e) => {
    const value = e.target.value
    setAge(value)
    setErrors(prev => ({ ...prev, age: '' }))
  }

  const handleAgeBlur = () => {
    validateAge(age)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!selectedConstituency && campaignData.target === 'national') newErrors.constituency = 'Constituency is required'
    if (selectedReasons.length === 0) newErrors.reason = 'Please select at least one reason'
    if (selectedTones.length === 0) newErrors.tones = 'Please select at least one tone'
    if (ageError) newErrors.age = ageError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const formData = {
      constituency: selectedConstituency ? selectedConstituency.constituency : campaignData.target,
      mpEmail: selectedConstituency ? selectedConstituency.email : null,
      age: age || null,
      reasons: [
        ...selectedReasons.map(reason => `${reason} - ${reasons[reason]}`),
        ...selectedCustomCauses.map(cause => `${cause} - ${customCauses[cause]}`)
      ],
      tones: selectedTones
    }

    onSubmit(formData)
  }


  const isFormValid = () => {
    return (
      (selectedConstituency || campaignData.target !== 'national') &&
      selectedReasons.length > 0 &&
      selectedTones.length > 0 &&
      !ageError
    )
  }

  const handleToneSelection = (tone) => {
    setSelectedTones(prevTones => {
      if (prevTones.includes(tone)) {
        return prevTones.filter(t => t !== tone)
      } else if (prevTones.length < 3) {
        return [...prevTones, tone]
      }
      return prevTones
    })
    setErrors(prev => ({ ...prev, tones: '' }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [supabase.auth])

  return (
    <Card className="w-full max-w-3xl mt-16 mx-auto relative">
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
        <CardTitle>{campaignData.campaign_name}</CardTitle>
        <CardDescription>{campaignData.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="constituency">
              {campaignData.target === 'national' ? 'Find Your Constituency or MP*' : campaignData.target}
            </Label>
            {campaignData.target === 'national' ? (
              <div className="relative">
                <Input
                  id="constituency"
                  type="text"
                  placeholder="Start typing your MP's name or constituency"
                  value={constituencySearch}
                  onChange={handleConstituencySearch}
                  className={errors.constituency ? 'border-red-500' : ''}
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto">
                    {suggestions.map((suggestion) => (
                      <li
                        key={suggestion.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedConstituency(suggestion)
                          setConstituencySearch(suggestion.searchString)
                          setSuggestions([])
                          setErrors(prev => ({ ...prev, constituency: '' }))
                        }}
                      >
                        {suggestion.searchString}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Input
                id="constituency"
                type="text"
                value={campaignData.target}
                readOnly
                className="bg-gray-100"
              />
            )}
            {errors.constituency && <span className="text-red-500 text-sm">{errors.constituency}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="age">Your Age (Optional)</Label>
            <Input 
              id="age" 
              type="number" 
              placeholder="Enter your age (optional)" 
              value={age}
              onChange={handleAgeChange}
              onBlur={handleAgeBlur}
              className={ageError ? 'border-red-500' : ''}
            />
            {ageError && <span className="text-red-500 text-sm">{ageError}</span>}
          </div>
          <div className="grid gap-2">
            <Label>Why Is This Campaign Important To You? (Select up to 2)*</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries({...reasons, ...customCauses}).map(([cause, description]) => (
                <Button
                  key={cause}
                  type="button"
                  variant={selectedReasons.includes(cause) || selectedCustomCauses.includes(cause) ? "default" : "outline"}
                  className={`h-auto flex flex-col items-start text-left p-4 space-y-2 w-full 
                    ${errors.cause ? 'border-red-500' : ''}
                    ${(selectedReasons.length + selectedCustomCauses.length) >= 2 && 
                      !selectedReasons.includes(cause) && 
                      !selectedCustomCauses.includes(cause) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={(selectedReasons.length + selectedCustomCauses.length) >= 2 && 
                            !selectedReasons.includes(cause) && 
                            !selectedCustomCauses.includes(cause)}
                  onClick={() => {
                    if ((selectedReasons.length + selectedCustomCauses.length) < 2 || 
                        selectedReasons.includes(cause) || 
                        selectedCustomCauses.includes(cause)) {
                      if (Object.keys(reasons).includes(cause)) {
                        setSelectedReasons(prevReasons => {
                          if (prevReasons.includes(cause)) {
                            return prevReasons.filter(r => r !== cause)
                          } else if ((prevReasons.length + selectedCustomCauses.length) < 2) {
                            return [...prevReasons, cause]
                          }
                          return prevReasons
                        })
                      } else {
                        setSelectedCustomCauses(prevCauses => {
                          if (prevCauses.includes(cause)) {
                            return prevCauses.filter(c => c !== cause)
                          } else if ((prevCauses.length + selectedReasons.length) < 2) {
                            return [...prevCauses, cause]
                          }
                          return prevCauses
                        })
                      }
                      setErrors(prev => ({ ...prev, cause: '' }))
                    }
                  }}
                >
                  <span className="font-bold text-lg w-full break-words">{cause}</span>
                  <span className="text-sm w-full whitespace-normal">{description}</span>
                </Button>
              ))}
            </div>
            {errors.cause && <span className="text-red-500 text-sm">{errors.cause}</span>}
          </div>
          <div className="grid gap-2">
            <Label>What Tone Do You Want to Write With? (Select up to 3)*</Label>
            <div className="flex flex-wrap gap-2">
              {tones.map((tone) => (
                <Button
                  key={tone}
                  type="button"
                  variant={selectedTones.includes(tone) ? "default" : "outline"}
                  className={`flex-grow-0 px-3 py-1 text-sm font-medium transition-colors ${errors.tones ? 'border-red-500' : ''}`}
                  onClick={() => handleToneSelection(tone)}
                  disabled={selectedTones.length >= 3 && !selectedTones.includes(tone)}
                >
                  {tone}
                </Button>
              ))}
            </div>
            {errors.tones && <span className="text-red-500 text-sm">{errors.tones}</span>}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          disabled={isSubmitting || !isFormValid()}
        >
          {isSubmitting ? 'Generating...' : `Generate Letter for ${campaignData.campaign_name}`}
        </Button>
      </CardFooter>
    </Card>
  )
}