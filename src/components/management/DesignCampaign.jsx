"use client"

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, Plus, X, FileText, Upload, Users, Building, FileSignature, ListChecks } from 'lucide-react'
import mpDepartments from '@/lib/mpDepartments.json'
import mpsData from '@/lib/mps.json'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CustomMotives } from "@/components/management/CustomMotives"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CampaignPromptDesigner({ campaignId, initialData, onSubmit, isSubmitting }) {
  const defaultMotives = [
    { id: 'personal', label: 'Personal Impact', description: 'This issue directly affects me or my loved ones.' },
    { id: 'community', label: 'Community Concern', description: 'I\'m worried about how this impacts my local community.' },
    { id: 'national', label: 'National Interest', description: 'I believe this is crucial for the future of our country.' },
    { id: 'global', label: 'Global Significance', description: 'This issue has worldwide implications that concern me.' },
    { id: 'moral', label: 'Moral Imperative', description: 'I feel a strong ethical obligation to support this cause.' },
  ]

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
  const [selectedMotives, setSelectedMotives] = useState(defaultMotives.map(cause => cause.id))
  const [shortDescriptionWordCount, setShortDescriptionWordCount] = useState(0)
  const [longDescriptionWordCount, setLongDescriptionWordCount] = useState(0)

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const mpConstituencies = mpsData.map(mp => ({
    id: mp.Name,
    name: mp.Name,
    constituency: mp.Constituency,
    email: mp.Email,
    searchString: `${mp.Name} - ${mp.Constituency}`
  }))

  const [allMotivesSelected, setAllMotivesSelected] = useState(true)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        ...initialData
      }))
      // If there are initial causes, update the selectedMotives and allMotivesSelected state
      if (initialData.causes && initialData.causes.length > 0) {
        const initialSelectedMotives = defaultMotives
          .filter(cause => initialData.causes.includes(cause.label))
          .map(cause => cause.id)
        setSelectedMotives(initialSelectedMotives)
        setAllMotivesSelected(initialSelectedMotives.length === defaultMotives.length)
      }
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

  const handleCustomMotivesChange = useCallback((causes) => {
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

  const validateForm = () => {
    const errors = {}

    if (!formData.campaign_name.trim()) {
      errors.campaign_name = "Campaign name is required"
    }

    if (!formData.short_description.trim()) {
      errors.short_description = "Short description is required"
    }

    if (!formData.long_description.trim()) {
      errors.long_description = "Detailed description is required"
    }

    const totalSelectedMotivations = selectedMotives.length + (formData.causes ? formData.causes.length : 0)
    if (totalSelectedMotivations < 2) {
      errors.causes = "Please select at least two motivations"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length > 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    const hasErrors = validateForm()
    if (hasErrors) {
      setSubmitError("Oops! Looks like you missed something.")
      return
    }

    try {
      // Prepare the final form data
      const finalFormData = {
        ...formData,
        recipient_type: recipientType,
        specific_mps: selectedMps,
        departments: selectedDepartments,
        causes: [
          ...selectedMotives.map(id => defaultMotives.find(cause => cause.id === id).label),
          ...(formData.causes || [])
        ],
        templates: templates
      }

      console.log("Submitting form data:", finalFormData)
      await onSubmit(finalFormData)
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
      setMpSuggestions(filteredSuggestions.slice(0, 10)) // Limit to 10 suggestions
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

  const handleMotiveChange = (causeId) => {
    setSelectedMotives(prev => {
      if (prev.includes(causeId)) {
        return prev.filter(id => id !== causeId)
      } else {
        return [...prev, causeId]
      }
    })
  }

  const handleSelectAllMotives = (checked) => {
    setAllMotivesSelected(checked)
    if (checked) {
      setSelectedMotives(defaultMotives.map(cause => cause.id))
    } else {
      setSelectedMotives([])
    }
  }

  useEffect(() => {
    setAllMotivesSelected(selectedMotives.length === defaultMotives.length)
  }, [selectedMotives])

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      causes: [
        ...selectedMotives.map(id => defaultMotives.find(cause => cause.id === id).label),
        ...(prev.causes || []).filter(cause => !defaultMotives.some(dc => dc.label === cause))
      ]
    }))
  }, [selectedMotives])

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>New Campaign</CardTitle>
          <CardDescription>Design a detailed prompt for the AI in {totalSteps} steps.</CardDescription>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center"><FileSignature className="mr-2" /> Campaign Details</h3>
                <h4 className="text-md font-semibold">Step 1: Basic Information</h4>
                <div className="space-y-2">
                  <Label htmlFor="campaign_name">Campaign Name</Label>
                  <Input
                    id="campaign_name"
                    name="campaign_name"
                    value={formData.campaign_name}
                    onChange={handleChange}
                    required
                  />
                  {validationErrors.campaign_name && (
                    <p className="text-red-500 text-sm">{validationErrors.campaign_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    name="short_description"
                    placeholder="Brief overview of the campaign (50 words max)."
                    value={formData.short_description}
                    onChange={handleChange}
                    className="min-h-[60px]"
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${shortDescriptionWordCount > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                      {shortDescriptionWordCount}/50 words
                    </p>
                    <Progress value={(shortDescriptionWordCount / 50) * 100} className="w-1/2" />
                  </div>
                  {validationErrors.short_description && (
                    <p className="text-red-500 text-sm">{validationErrors.short_description}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center"><Users className="mr-2" /> Letter Recipients</h3>
                <h4 className="text-md font-semibold">Step 2: Select the targets of your campaign</h4>
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
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Search for an MP or constituency"
                          value={mpSearch}
                          onChange={handleMpSearch}
                        />
                        {mpSuggestions.length > 0 && (
                          <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
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
                      </div>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent form submission
                          setShowDepartmentSearch(!showDepartmentSearch);
                        }}
                        className="w-full justify-start"
                        type="button" // Explicitly set button type to prevent form submission
                      >
                        <Building className="mr-2 h-4 w-4" />
                        Departments
                        {selectedDepartments.length > 0 && (
                          <span className="ml-2 text-sm text-gray-500">({selectedDepartments.length} selected)</span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Include specific departments</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {showDepartmentSearch && (
                    <div className="ml-6 space-y-2">
                      <Select
                        onValueChange={(value) => addDepartment(JSON.parse(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          {mpDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={JSON.stringify(dept)}>
                              {dept.department} - {dept.mp}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center"><ListChecks className="mr-2" /> Motivations</h3>
                <h4 className="text-md font-semibold">Step 3: Why do supporters care about your campaign?</h4>
                <h5 className="text-sm italic">You may want to match these options with your supporter segments.</h5>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="select-all-causes"
                    checked={allMotivesSelected}
                    onCheckedChange={handleSelectAllMotives}
                  />
                  <label
                    htmlFor="select-all-causes"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {allMotivesSelected ? 'Deselect All' : 'Select All'}
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {defaultMotives.map((cause) => (
                    <div key={cause.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={cause.id}
                        checked={selectedMotives.includes(cause.id)}
                        onCheckedChange={() => handleMotiveChange(cause.id)}
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
                {validationErrors.causes && (
                  <p className="text-red-500 text-sm">{validationErrors.causes}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="custom_causes">Custom Motives</Label>
                  <CustomMotives onChange={handleCustomMotivesChange} />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center"><FileText className="mr-2" /> Detailed Description</h3>
                <h4 className="text-md font-semibold">Step 4: Provide In-Depth Context</h4>
                <div className="space-y-2">
                  <Label htmlFor="long_description">Campaign Details</Label>
                  <Textarea
                    id="long_description"
                    name="long_description"
                    placeholder="Provide detailed information, statistics, and context for the AI (1500 words max)."
                    value={formData.long_description}
                    onChange={handleChange}
                    className="min-h-[200px]"
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${longDescriptionWordCount > 1500 ? 'text-red-500' : 'text-gray-500'}`}>
                      {longDescriptionWordCount}/1500 words
                    </p>
                    <Progress value={(longDescriptionWordCount / 1500) * 100} className="w-1/2" />
                  </div>
                  {validationErrors.long_description && (
                    <p className="text-red-500 text-sm">{validationErrors.long_description}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center"><Upload className="mr-2" /> Letter Templates</h3>
                <h4 className="text-md font-semibold">Step 5: Add Example Letters</h4>
                <h5 className="text-sm italic">AI loves examples.</h5>
                <Label>Upload or paste up to 3 templates</Label>
                
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
            )}
            
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentStep > 1 && (
            <Button type="button" onClick={prevStep} variant="outline">
              Previous
            </Button>
          )}
          {currentStep < totalSteps ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Campaign Prompt'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}