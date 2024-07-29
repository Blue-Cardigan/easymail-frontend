'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ExistingCampaignModal from '@/components/ExistingCampaignModal'
import { Button } from '@/components/ui/button'

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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Campaign Management</h1>
      <div className="space-y-4">
        {user ? (
          <>
            <Link href="/admin/new">
              <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create New Campaign
              </Button>
            </Link>
            <Button onClick={handleSignOut} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Sign Out
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Login to Create Campaign
            </Button>
          </Link>
        )}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate Letter for Existing Campaign
        </Button>
      </div>
      {isModalOpen && <ExistingCampaignModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}