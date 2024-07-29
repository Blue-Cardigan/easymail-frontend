"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import valuemodes from '@/lib/valuemodes.json'
import tones from '@/lib/tones.json'
import mpsData from '@/lib/mps.json'

export function ConstituentForm({ campaignId, campaignData }) {
  const router = useRouter()
  const [constituencySearch, setConstituencySearch] = useState('')
  const [selectedConstituency, setSelectedConstituency] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [age, setAge] = useState('')
  const [selectedTones, setSelectedTones] = useState([])
  const [selectedValuemode, setSelectedValuemode] = useState('')
  const [availableTones, setAvailableTones] = useState([])
  const [errors, setErrors] = useState({})

  const mpConstituencies = mpsData.map(mp => ({
    id: mp.Name,
    name: mp.Name,
    constituency: mp.Constituency,
    email: mp.Email,
    searchString: `${mp.Name} - ${mp.Constituency}`
  }))

  useEffect(() => {
    if (selectedValuemode) {
      setAvailableTones(tones[selectedValuemode].Tones)
      setSelectedTones([])
    } else {
      setAvailableTones([])
    }
  }, [selectedValuemode])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!selectedConstituency) newErrors.constituency = 'Constituency is required'
    if (!age) newErrors.age = 'Age is required'
    if (!selectedValuemode) newErrors.valuemode = 'Please select your values'
    if (selectedTones.length === 0) newErrors.tones = 'Please select at least one tone'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const formData = {
      campaignId,
      constituency: selectedConstituency.constituency,
      mp: selectedConstituency.name,
      mpEmail: selectedConstituency.email,
      age,
      valuemode: selectedValuemode,
      tones: selectedTones
    }

    router.push(`/campaign/${campaignId}/response?data=${encodeURIComponent(JSON.stringify(formData))}`)
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
        <CardTitle>Campaign Letter Generator</CardTitle>
        <CardDescription>Enter some basic information and we'll tailor a letter for you to send to your MP.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="constituency">Constituency or MP*</Label>
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
            <Label>Your Values*</Label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(valuemodes).map(([mode, { description }]) => (
                <Button
                  key={mode}
                  type="button"
                  variant={selectedValuemode === mode ? "default" : "outline"}
                  className={`h-auto flex flex-col items-start text-left p-4 space-y-2 w-full ${errors.valuemode ? 'border-red-500' : ''}`}
                  onClick={() => {
                    setSelectedValuemode(mode)
                    setErrors(prev => ({ ...prev, valuemode: '' }))
                  }}
                >
                  <span className="font-bold text-lg w-full break-words">{mode}</span>
                  <span className="text-sm w-full whitespace-normal">{description}</span>
                </Button>
              ))}
            </div>
            {errors.valuemode && <span className="text-red-500 text-sm">{errors.valuemode}</span>}
          </div>
          {selectedValuemode && (
            <div className="grid gap-2">
              <Label>Tone (Select up to 3)*</Label>
              <div className="flex flex-wrap gap-2">
                {availableTones.map((tone) => (
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
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit" onClick={handleSubmit}>
          Generate Letter
        </Button>
      </CardFooter>
    </Card>
  )
}