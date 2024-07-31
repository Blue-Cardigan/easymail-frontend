"use client"

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateCampaign } from '@/lib/supabase'

export default function CampaignPromptDesigner({ campaignId, initialData, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(initialData)
  const [parsedTemplates, setParsedTemplates] = useState([])
  const [uploadError, setUploadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)

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
    setSubmitError(null)

    try {
      console.log('Submitting form data:', formData)
      onSubmit(formData)
    } catch (error) {
      console.error('Error creating campaign:', error)
      setSubmitError(error.message || 'An error occurred while creating the campaign')
    }
  }

  const onDrop = async (acceptedFiles) => {
    if (parsedTemplates.length + acceptedFiles.length > 3) {
      setUploadError('You can only upload up to 3 templates.');
      return;
    }

    setUploadError(null);

    const processFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            content: e.target.result
          });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    };

    try {
      const newTemplates = await Promise.all(acceptedFiles.map(processFile));
      setParsedTemplates(prev => [...prev, ...newTemplates]);
      setFormData(prev => ({
        ...prev,
        docs: [...(prev.docs || []), ...newTemplates]
      }));
    } catch (error) {
      setUploadError(`Error processing files: ${error.message}`);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
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
        <form className="space-y-6" onSubmit={handleSubmit}>
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
            {parsedTemplates.length > 0 && (
              <div>
                <p>Uploaded templates:</p>
                <ul>
                  {parsedTemplates.map((template, index) => (
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
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Campaign Prompt'}
        </Button>
      </CardFooter>
    </Card>
  )
}