'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExistingCampaignModal from '@/components/ExistingCampaignModal'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { Carousel } from 'react-responsive-carousel'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import "react-responsive-carousel/lib/styles/carousel.min.css"

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const carouselImages = [
    '/landingpage/pageoftext.jpg',
    '/landingpage/fountainpen.jpg',
    '/landingpage/grouptyping.jpg',
    '/landingpage/individualwriting.jpg',
    '/landingpage/individualwritingbench.jpg',
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-6">Empower Your Supporters with AI-Generated Letters</h1>
            <p className="text-xl mb-8">
              Easymail allows campaigning organisations to amplify their impact by generating unique, 
              personalized letters for supporters to send to decision-makers.
            </p>
            <Link href="/campaigns">
              <Button size="lg">Try It Now</Button>
            </Link>
          </div>
          <div className="relative h-96">
            <Carousel
              autoPlay
              infiniteLoop
              showStatus={false}
              showThumbs={false}
              interval={5000}
              className="rounded-lg shadow-xl overflow-hidden"
            >
              {carouselImages.map((image, index) => (
                <div key={index} className="h-96">
                  <Image 
                    src={image}
                    alt={`AI-powered letter writing ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Create',
                description: 'Set up your campaign with your templates and research. Our AI will use these to generate personalized letters for your supporters.'
              },
              {
                title: 'Share',
                description: 'Distribute your campaign link to supporters. They can quickly generate unique, persuasive letters to send to decision-makers.'
              },
              {
                title: 'Monitor',
                description: 'Track your campaign\'s performance with our real-time analytics dashboard.'
              }
            ].map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">{index + 1}. {step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        {/* New Call-to-Action Section */}
        <div className="mt-24 bg-blue-50 p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Amplify Your Campaign?</h2>
          <p className="text-xl mb-8">
            Get in touch with us to create your own AI-powered letter campaign and make a bigger impact.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Contact Us to Get Started
            </Button>
          </Link>
        </div>
      </main>

      <Footer />

      {isModalOpen && <ExistingCampaignModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}