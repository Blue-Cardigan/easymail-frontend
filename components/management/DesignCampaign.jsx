"use client"

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, Plus, X, FileText, Upload } from 'lucide-react'
import mpDepartments from '@/lib/mpDepartments.json'
import mpsData from '@/lib/mps.json'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CustomCauses } from "@/components/management/CustomCauses"
import { Checkbox } from "@/components/ui/checkbox"

export default function CampaignPromptDesigner({ campaignId, initialData, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    ...initialData,
    recipient_type: 'all_mps',
    specific_mps: '',
  })
  const [parsedTemplates, setParsedTemplates] = useState([])
  const [uploadError, setUploadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [showPlaintextInput, setShowPlaintextInput] = useState(false)
  const [plaintextTemplate, setPlaintextTemplate] = useState("")
  const [templates, setTemplates] = useState([])
  const [currentTemplate, setCurrentTemplate] = useState({ type: null, content: '' })
  const [departmentSearch, setDepartmentSearch] = useState('')
  const [departmentSuggestions, setDepartmentSuggestions] = useState([])
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [showDepartmentSearch, setShowDepartmentSearch] = useState(false)
  const [mpSearch, setMpSearch] = useState('')
  const [mpSuggestions, setMpSuggestions] = useState([])
  const [selectedMps, setSelectedMps] = useState([])
  const [recipientType, setRecipientType] = useState('all_mps')
  const [includeDepartments, setIncludeDepartments] = useState(false)
  const [selectedCauses, setSelectedCauses] = useState([])
  const [shortDescriptionWordCount, setShortDescriptionWordCount] = useState(0)
  const [longDescriptionWordCount, setLongDescriptionWordCount] = useState(0)

  const mpConstituencies = mpsData.map(mp => ({
    id: mp.Name,
    name: mp.Name,
    constituency: mp.Constituency,
    email: mp.Email,
    searchString: `${mp.Name} - ${mp.Constituency}`
  }))

  const defaultCauses = [
    { id: 'personal', label: 'Personal Impact', description: 'This issue directly affects me or my loved ones.' },
    { id: 'community', label: 'Community Concern', description: 'I\'m worried about how this impacts my local community.' },
    { id: 'national', label: 'National Interest', description: 'I believe this is crucial for the future of our country.' },
    { id: 'global', label: 'Global Significance', description: 'This issue has worldwide implications that concern me.' },
    { id: 'moral', label: 'Moral Imperative', description: 'I feel a strong ethical obligation to support this cause.' },
  ]

  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        ...initialData
      }))
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))

    if (name === 'short_description') {
      setShortDescriptionWordCount(countWords(value))
    } else if (name === 'long_description') {
      setLongDescriptionWordCount(countWords(value))
    }
  }

  const countWords = (text) => {
    return text.trim().split(/\s+/).length
  }

  const handleCustomCausesChange = useCallback((causes) => {
    setFormData(prevData => ({
      ...prevData,
      causes: causes
    }))
  }, [])

  const handleRecipientTypeChange = (value) => {
    setRecipientType(value)
    if (value === 'all_mps') {
      setSelectedMps([])
    }
  }

  const toggleDepartments = (checked) => {
    setIncludeDepartments(checked)
    if (checked) {
      setShowDepartmentSearch(true)
    } else {
      setShowDepartmentSearch(false)
      setSelectedDepartments([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    try {
      onSubmit(formData)
    } catch (error) {
      console.error('Error creating campaign:', error)
      setSubmitError(error.message || 'An error occurred while creating the campaign')
    }
  }

  const handlePlaintextToggle = () => {
    setShowPlaintextInput(!showPlaintextInput)
  }

  const handlePlaintextChange = (e) => {
    setPlaintextTemplate(e.target.value)
  }

  const handlePlaintextSubmit = () => {
    if (plaintextTemplate.trim()) {
      const newTemplate = {
        name: `Plaintext Template ${parsedTemplates.length + 1}`,
        content: plaintextTemplate.trim()
      }
      setParsedTemplates(prev => [...prev, newTemplate])
      setFormData(prev => ({
        ...prev,
        docs: [...(prev.docs || []), newTemplate]
      }))
      setPlaintextTemplate("")
    }
  }

  const addTemplate = (type, content = '') => {
    if (templates.length >= 3) {
      setUploadError('You can only add up to 3 templates.')
      return
    }
    setTemplates([...templates, { type, content }])
    setCurrentTemplate({ type: null, content: '' })
  }

  const removeTemplate = (index) => {
    setTemplates(templates.filter((_, i) => i !== index))
  }

  const onDrop = async (acceptedFiles) => {
    if (templates.length + acceptedFiles.length > 3) {
      setUploadError('You can only add up to 3 templates.')
      return
    }

    const processFile = async (file) => {
      const content = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsText(file)
      })
      return { type: 'file', content, name: file.name }
    }

    const newTemplates = await Promise.all(acceptedFiles.map(processFile))
    setTemplates([...templates, ...newTemplates])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 3 - templates.length
  })

  const handleDepartmentSearch = (e) => {
    const value = e.target.value
    setDepartmentSearch(value)

    if (value.length > 0) {
      const filteredSuggestions = mpDepartments.filter(
        (dept) => 
          dept.department.toLowerCase().includes(value.toLowerCase()) ||
          dept.mp.toLowerCase().includes(value.toLowerCase())
      )
      setDepartmentSuggestions(filteredSuggestions)
    } else {
      setDepartmentSuggestions([])
    }
  }

  const addDepartment = (department) => {
    if (!selectedDepartments.some(dept => dept.id === department.id)) {
      setSelectedDepartments([...selectedDepartments, department])
    }
    setDepartmentSearch('')
    setDepartmentSuggestions([])
  }

  const removeDepartment = (departmentId) => {
    setSelectedDepartments(selectedDepartments.filter(dept => dept.id !== departmentId))
  }

  const handleMpSearch = (e) => {
    const value = e.target.value
    setMpSearch(value)

    if (value.length > 0) {
      const filteredSuggestions = mpConstituencies.filter(
        (mp) => mp.searchString.toLowerCase().includes(value.toLowerCase())
      )
      setMpSuggestions(filteredSuggestions)
    } else {
      setMpSuggestions([])
    }
  }

  const addMp = (mp) => {
    if (!selectedMps.some(selectedMp => selectedMp.id === mp.id)) {
      setSelectedMps([...selectedMps, mp])
    }
    setMpSearch('')
    setMpSuggestions([])
  }

  const removeMp = (mpId) => {
    setSelectedMps(selectedMps.filter(mp => mp.id !== mpId))
  }

  const clearSelectedMPs = () => {
    setSelectedMps([])
  }

  const handleCauseChange = (causeId) => {
    setSelectedCauses(prev => {
      if (prev.includes(causeId)) {
        return prev.filter(id => id !== causeId)
      } else {
        return [...prev, causeId]
      }
    })
  }

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      causes: [
        ...selectedCauses.map(id => defaultCauses.find(cause => cause.id === id).label),
        ...(prev.causes || []).filter(cause => !defaultCauses.some(dc => dc.label === cause))
      ]
    }))
  }, [selectedCauses])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>New Campaign</CardTitle>
        <CardDescription>Answer the following questions to design a detailed prompt for our LLM.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Campaign Name</h3>
            <Input
              id="campaign_name"
              name="campaign_name"
              value={formData.campaign_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold">Letter Recipients</h3>
            
            <div className="space-y-4">
              <h4 className="text-md font-semibold">Primary Recipients</h4>
              <RadioGroup
                onValueChange={handleRecipientTypeChange}
                value={recipientType}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all_mps" id="all_mps" />
                  <Label htmlFor="all_mps">All constituency MPs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific_mps" id="specific_mps" />
                  <Label htmlFor="specific_mps">Specific MPs</Label>
                </div>
              </RadioGroup>
              
              {recipientType === 'specific_mps' && (
                <div className="ml-6 space-y-2">
                  <Input
                    type="text"
                    placeholder="Search for an MP or constituency"
                    value={mpSearch}
                    onChange={handleMpSearch}
                  />
                  {mpSuggestions.length > 0 && (
                    <ul className="max-h-60 overflow-auto border border-gray-200 rounded-md">
                      {mpSuggestions.map((mp) => (
                        <li
                          key={mp.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => addMp(mp)}
                        >
                          {mp.searchString}
                        </li>
                      ))}
                    </ul>
                  )}
                  {selectedMps.length > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center">
                        <Label>Selected MPs: {selectedMps.length}</Label>
                        <Button variant="ghost" size="sm" onClick={clearSelectedMPs}>Clear all</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedMps.map((mp) => (
                          <div
                            key={mp.id}
                            className="flex items-center bg-gray-100 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => removeMp(mp.id)}
                          >
                            <span>{mp.name} - {mp.constituency}</span>
                            <X size={12} className="ml-2 text-gray-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h4 className="text-md font-semibold">Additional Recipients</h4>
              <Button
                variant="outline"
                onClick={() => setShowDepartmentSearch(!showDepartmentSearch)}
                className="w-full justify-start"
              >
                <Plus className="mr-2 h-4 w-4" />
                Include specific government departments
                {selectedDepartments.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">({selectedDepartments.length} selected)</span>
                )}
              </Button>
              
              {showDepartmentSearch && (
                <div className="ml-6 space-y-2">
                  <Input
                    type="text"
                    placeholder="Search for a department or MP"
                    value={departmentSearch}
                    onChange={handleDepartmentSearch}
                  />
                  {departmentSuggestions.length > 0 && (
                    <ul className="max-h-60 overflow-auto border border-gray-200 rounded-md">
                      {departmentSuggestions.map((dept) => (
                        <li
                          key={dept.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => addDepartment(dept)}
                        >
                          {dept.department} - {dept.mp}
                        </li>
                      ))}
                    </ul>
                  )}
                  {selectedDepartments.length > 0 && (
                    <div className="mt-2">
                      <Label>Selected Departments:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedDepartments.map((dept) => (
                          <div
                            key={dept.id}
                            className="flex items-center bg-gray-100 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => removeDepartment(dept.id)}
                          >
                            <span>{dept.department} - {dept.mp}</span>
                            <X size={12} className="ml-2 text-gray-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold">Short Description</h3>
            <Textarea
              id="campaign_objectives"
              name="short_description"
              placeholder="Provide a short description of the campaign and its objectives to display at the top of the campaign page (100 words max)."
              value={formData.short_description}
              onChange={handleChange}
              className="min-h-[60px]"
              required
            />
            <p className={`text-sm ${shortDescriptionWordCount > 100 ? 'text-red-500' : 'text-gray-500'}`}>
              {shortDescriptionWordCount}/100 words
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Long Description</h3>
            <Textarea
              id="evidence_data"
              name="long_description"
              placeholder="Paste full campaign description here (1500 words max)."
              value={formData.long_description}
              onChange={handleChange}
              className="min-h-[100px]"
              required
            />
            <p className={`text-sm ${longDescriptionWordCount > 1500 ? 'text-red-500' : 'text-gray-500'}`}>
              {longDescriptionWordCount}/1500 words
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Causes</h3>
            <div className="grid grid-cols-2 gap-4">
              {defaultCauses.map((cause) => (
                <div key={cause.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={cause.id}
                    checked={selectedCauses.includes(cause.id)}
                    onCheckedChange={() => handleCauseChange(cause.id)}
                  />
                  <label
                    htmlFor={cause.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {cause.label}
                    <p className="text-sm text-muted-foreground">{cause.description}</p>
                  </label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom_causes">Custom Causes</Label>
              <CustomCauses onChange={handleCustomCausesChange} />
            </div>
          </div>
          
          <div className="space-y-4">
            <Label>Letter Templates (up to 3)</Label>
            
            {templates.map((template, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                <FileText size={20} />
                <span className="flex-grow truncate">
                  {template.type === 'file' ? template.name : `Pasted Template ${index + 1}`}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeTemplate(index)}
                >
                  <X size={20} />
                </Button>
              </div>
            ))}

            {templates.length < 3 && (
              <div className="space-y-4">
                {currentTemplate.type === null ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button 
                      type="button" 
                      onClick={() => setCurrentTemplate({ type: 'paste', content: '' })}
                      className="w-full h-24 flex flex-col items-center justify-center bg-white text-black border border-gray-300 hover:bg-gray-100"
                      variant="outline"
                    >
                      <PlusCircle className="mb-2" size={24} />
                      <span>Paste Text</span>
                    </Button>
                    <div 
                      {...getRootProps()} 
                      className="col-span-2 w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <input {...getInputProps()} />
                      <Upload size={24} className="mb-2" />
                      <p>{isDragActive ? "Drop files here" : "Upload File"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Paste your template text here..."
                      value={currentTemplate.content}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, content: e.target.value })}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentTemplate({ type: null, content: '' })}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => addTemplate('paste', currentTemplate.content)}
                        disabled={!currentTemplate.content.trim()}
                      >
                        Add Template
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {uploadError && (
              <Alert variant="destructive">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </div>
          
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isSubmitting || shortDescriptionWordCount > 100 || longDescriptionWordCount > 1500}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Campaign Prompt'}
        </Button>
      </CardFooter>
    </Card>
  )
}