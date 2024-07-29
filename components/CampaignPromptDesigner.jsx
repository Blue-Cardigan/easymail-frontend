"use client"

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import * as pdfjsLib from 'pdfjs-dist'
import { updateCampaign } from '@/lib/supabase'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function CampaignPromptDesigner({ initialData }) {
  const [formData, setFormData] = useState({
    campaign_name: '',
    name: '',
    campaign_objectives: '',
    evidence_data: '',
    current_status: '',
    desired_response: '',
    local_relevance: '',
    ...initialData
  })
  const [templates, setTemplates] = useState([])
  const [uploadError, setUploadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      console.log('Submitting form data:', formData)
      const result = await updateCampaign(formData)
      console.log('Campaign created successfully:', result)
      // Handle successful creation (e.g., show success message, redirect)
    } catch (error) {
      console.error('Error creating campaign:', error)
      setSubmitError(error.message || 'An error occurred while creating the campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDrop = async (acceptedFiles) => {
    if (templates.length + acceptedFiles.length > 3) {
      setUploadError('You can only upload up to 3 templates.')
      return
    }

    setUploadError(null)

    const processFile = async (file) => {
      if (file.type === 'application/pdf') {
        return await parsePdf(file)
      } else if (file.type.includes('word')) {
        return await parseWord(file)
      } else {
        throw new Error('Unsupported file type')
      }
    }

    try {
      const newTemplates = await Promise.all(acceptedFiles.map(processFile))
      setTemplates(prev => [...prev, ...newTemplates])
    } catch (error) {
      setUploadError(`Error processing files: ${error.message}`)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 3
  })

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Campaign Prompt Designer</CardTitle>
        <CardDescription>Design your campaign prompt by answering the following questions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign_objectives">Campaign Objectives and Key Issues</Label>
            <Textarea
              id="campaign_objectives"
              name="campaign_objectives"
              placeholder="What are the primary objectives of your campaign, and what specific issues are you aiming to address through this initiative?"
              value={formData.campaign_objectives}
              onChange={handleChange}
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evidence_data">Evidence and Supporting Data</Label>
            <Textarea
              id="evidence_data"
              name="evidence_data"
              placeholder="Could you provide detailed evidence or data supporting the urgency of this issue, such as statistics, scientific studies, or expert opinions?"
              value={formData.evidence_data}
              onChange={handleChange}
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_status">Current Status and Political Actions</Label>
            <Textarea
              id="current_status"
              name="current_status"
              placeholder="What is the current status of the issue within the political landscape, and what actions (if any) have been taken by the government or relevant authorities so far?"
              value={formData.current_status}
              onChange={handleChange}
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desired_response">Desired Political Response</Label>
            <Textarea
              id="desired_response"
              name="desired_response"
              placeholder="What specific actions or responses are you seeking from MPs? For example, are you asking them to write to a particular government official, support a policy change, or raise the issue in parliamentary discussions?"
              value={formData.desired_response}
              onChange={handleChange}
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="local_relevance">Constituent Impact and Local Relevance</Label>
            <Textarea
              id="local_relevance"
              name="local_relevance"
              placeholder="How does this issue impact constituents in the MPs' constituencies, and are there any local examples or testimonials that could highlight the significance and urgency of the issue?"
              value={formData.local_relevance}
              onChange={handleChange}
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Upload Letter Templates (up to 3)</Label>
            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
              )}
            </div>
            {templates.length > 0 && (
              <div>
                <p>Uploaded templates:</p>
                <ul>
                  {templates.map((template, index) => (
                    <li key={index}>{template.name}</li>
                  ))}
                </ul>
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
        <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Campaign Prompt'}
        </Button>
      </CardFooter>
    </Card>
  )
}

async function parsePdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target.result)
        const pdf = await pdfjsLib.getDocument(typedArray).promise
        let fullText = ''

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items.map(item => item.str).join(' ')
          fullText += pageText + '\n'
        }

        resolve({ name: file.name, content: fullText })
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

async function parseWord(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/parse-word', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Failed to parse Word document')
  }

  const result = await response.json()
  return { name: file.name, content: result.content }
}