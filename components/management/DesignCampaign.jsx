"use client"

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, X, FileText, Upload } from 'lucide-react'
import { CustomCauses } from "@/components/management/components/CustomCauses"

export default function CampaignPromptDesigner({ campaignId, initialData, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(initialData)
  const [parsedTemplates, setParsedTemplates] = useState([])
  const [uploadError, setUploadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [showPlaintextInput, setShowPlaintextInput] = useState(false)
  const [plaintextTemplate, setPlaintextTemplate] = useState("")
  const [templates, setTemplates] = useState([])
  const [currentTemplate, setCurrentTemplate] = useState({ type: null, content: '' })

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
  }

  const handleCustomCausesChange = useCallback((causes) => {
    setFormData(prevData => ({
      ...prevData,
      causes: causes
    }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    try {
      await onSubmit(formData)
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>New Campaign</CardTitle>
          <CardDescription>Answer the following questions to design a detailed prompt for our LLM.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="campaign_name">Campaign Name</Label>
              <Input
                id="campaign_name"
                name="campaign_name"
                value={formData.campaign_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_objectives">Short Description</Label>
              <Textarea
                id="campaign_objectives"
                name="short_description"
                placeholder="Provide a short description of the campaign and its objectives to display at the top of the campaign page (100 words max)."
                value={formData.short_description}
                onChange={handleChange}
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evidence_data">Long Description</Label>
              <Textarea
                id="evidence_data"
                name="long_description"
                placeholder="Paste full campaign description here (1500 words max)."
                value={formData.long_description}
                onChange={handleChange}
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom_causes">Custom Causes</Label>
              <CustomCauses onChange={handleCustomCausesChange} />
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
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Campaign Prompt'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

