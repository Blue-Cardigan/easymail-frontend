'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
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
    <header className="w-full bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.png" alt="Easymail Logo" width={150} height={50} />
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
              <Link href="/admin/new">
                <Button>Create Campaign</Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
          <Link href="/campaigns">
            <Button variant="secondary">Generate Letter</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}