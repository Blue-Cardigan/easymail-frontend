"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import mpsData from '@/lib/mps.json'

const tones = [
  "Urgent",
  "Concerned",
  "Hopeful",
  "Determined",
  "Respectful",
  "Passionate",
  "Analytical",
  "Empathetic",
  "Persuasive",
  "Collaborative",
  "Assertive",
  "Informative",
  "Optimistic",
  "Critical",
  "Pragmatic",
  "Inspirational",
  "Diplomatic",
  "Authoritative",
  "Inquisitive",
  "Supportive"
]

export function ConstituentForm({ campaignId, campaignData, onSubmit, isSubmitting }) {
  const [constituencySearch, setConstituencySearch] = useState('')
  const [selectedConstituency, setSelectedConstituency] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [age, setAge] = useState('')
  const [selectedReasons, setSelectedReasons] = useState([])
  const [selectedTones, setSelectedTones] = useState([])
  const [errors, setErrors] = useState({})

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
  }

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

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!selectedConstituency && campaignData.target === 'national') newErrors.constituency = 'Constituency is required'
    if (!age) newErrors.age = 'Age is required'
    if (selectedReasons.length === 0) newErrors.reason = 'Please select at least one reason'
    if (selectedTones.length === 0) newErrors.tones = 'Please select at least one tone'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const formData = {
      constituency: selectedConstituency ? selectedConstituency.constituency : campaignData.target,
      mpEmail: selectedConstituency ? selectedConstituency.email : null,
      age,
      reasons: selectedReasons.map(reason => `${reason} - ${reasons[reason]}`),
      tones: selectedTones
    }

    onSubmit(formData)
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{campaignData.campaign_name}</CardTitle>
        <CardDescription>{campaignData.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="constituency">
              {campaignData.target === 'national' ? 'Constituency or MP*' : campaignData.target}
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
            <Label htmlFor="age">Age*</Label>
            <Input 
              id="age" 
              type="number" 
              placeholder="Enter your age" 
              value={age}
              onChange={(e) => {
                setAge(e.target.value)
                setErrors(prev => ({ ...prev, age: '' }))
              }}
              className={errors.age ? 'border-red-500' : ''}
            />
            {errors.age && <span className="text-red-500 text-sm">{errors.age}</span>}
          </div>
          <div className="grid gap-2">
            <Label>Why is this campaign important to you? (Select up to 2)*</Label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(reasons).map(([reason, description]) => (
                <Button
                  key={reason}
                  type="button"
                  variant={selectedReasons.includes(reason) ? "default" : "outline"}
                  className={`h-auto flex flex-col items-start text-left p-4 space-y-2 w-full 
                    ${errors.reason ? 'border-red-500' : ''}
                    ${selectedReasons.length >= 2 && !selectedReasons.includes(reason) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={selectedReasons.length >= 2 && !selectedReasons.includes(reason)}
                  onClick={() => {
                    if (selectedReasons.length < 2 || selectedReasons.includes(reason)) {
                      setSelectedReasons(prevReasons => {
                        if (prevReasons.includes(reason)) {
                          return prevReasons.filter(r => r !== reason)
                        } else if (prevReasons.length < 2) {
                          return [...prevReasons, reason]
                        }
                        return prevReasons
                      })
                      setErrors(prev => ({ ...prev, reason: '' }))
                    }
                  }}
                >
                  <span className="font-bold text-lg w-full break-words">{reason}</span>
                  <span className="text-sm w-full whitespace-normal">{description}</span>
                </Button>
              ))}
            </div>
            {errors.reason && <span className="text-red-500 text-sm">{errors.reason}</span>}
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
        <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Generating...' : `Generate Letter for ${campaignData.campaign_name}`}
        </Button>
      </CardFooter>
    </Card>
  )
}