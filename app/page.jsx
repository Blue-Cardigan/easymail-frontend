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
    '/frontpage/1.avif',
    '/frontpage/2.webp',
    '/frontpage/3.jpg',
    '/frontpage/4.avif',
    '/frontpage/5.jpg',
    '/frontpage/6.webp',
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-6">Ignite Change: Unleash the Power of AI-Driven Activism</h1>
            <p className="text-xl mb-8">
              Easymail revolutionizes grassroots movements, arming supporters with AI-crafted, 
              hard-hitting letters that demand action from those in power. Join the movement.
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
                title: 'Strategise',
                description: 'Craft powerful templates using your crucial research. Our AI weaponises this information to generate compelling letters for your supporters.'
              },
              {
                title: 'Mobilise',
                description: 'Share the campaign link with your supporters. They\'ll swiftly generate unique, hard-hitting letters to challenge decision-makers.'
              },
              {
                title: 'Analyse',
                description: 'Access our real-time analytics dashboard to gauge your campaign\'s impact.'
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
            Get in touch to create your own AI-powered letter campaign and make a bigger impact.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Contact Us to Get Started
            </Button>
          </Link>
        </div>
      </main>

      <Footer />

      {/* {isModalOpen && <ExistingCampaignModal onClose={() => setIsModalOpen(false)} />} */}
    </div>
  )
}