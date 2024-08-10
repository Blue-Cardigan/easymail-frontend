'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

async function getAllCampaigns() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = createClientComponentClient()

  const res = await fetch(`${supabaseUrl}/functions/v1/retrieveAllCampaigns`, {
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    }
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Failed to fetch campaigns: ${res.status} ${errorText}`)
    throw new Error(`Failed to fetch campaigns: ${res.status} ${errorText}`)
  }

  return res.json()
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const campaignsPerPage = 6

  useEffect(() => {
    fetchCampaigns()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchCampaigns = async () => {
    setIsLoading(true)
    try {
      const data = await getAllCampaigns()
      // Filter out campaigns with null url
      const validCampaigns = data.filter(campaign => campaign.url != null)
      setCampaigns(validCampaigns)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setError('Failed to fetch campaigns. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCampaignSelect = (campaignId) => {
    router.push(`/${campaignId}`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const indexOfLastCampaign = currentPage * campaignsPerPage
  const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage
  const currentCampaigns = campaigns.slice(indexOfFirstCampaign, indexOfLastCampaign)
  const totalPages = Math.ceil(campaigns.length / campaignsPerPage)

  if (isLoading) return <div className="text-center mt-8">Loading campaigns...</div>
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6 text-center">Active Campaigns</h1>
        <p className="text-xl mb-8 text-center">
          Choose a campaign below to generate a personalized letter and make your voice heard.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentCampaigns.map((campaign) => (
            <div 
              key={campaign.url} 
              onClick={() => handleCampaignSelect(campaign.url)}
              className="cursor-pointer transition-shadow hover:shadow-lg"
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{campaign.campaign_name}</CardTitle>
                  <CardDescription>{campaign.short_description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button className="w-full">
                    Select Campaign
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center space-x-2 mb-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              variant={currentPage === i + 1 ? "default" : "outline"}
            >
              {i + 1}
            </Button>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Want to create your own campaign?</h2>
          <p className="mb-4">Get in touch with us to set up a powerful AI-driven letter campaign for your cause.</p>
          <Link href="/contact">
            <Button size="lg">Contact Us</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}