'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'  // TODO: Change this import
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'

export default function Header() {
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const headerRef = useRef(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const supabase = createClientComponentClient()
  const router = useRouter() 

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }

    // Add resize listener to update header height if window size changes
    const handleResize = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsMenuOpen(false)
    
    // Redirect to homepage
    router.push('/')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <header 
        ref={headerRef}
        className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 z-50"
      >
        <div className="container mx-auto pl-0 flex justify-between items-center">
          <Link href="/" className="flex-shrink-0">
            <Image src="/logos/4.png" alt="Easymail Logo" width={200} height={50} />
          </Link>
          
          {/* Hamburger icon for mobile */}
          <button onClick={toggleMenu} className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Menu for desktop */}
          <div className="hidden md:flex space-x-4">
            {user ? (
              <>
                <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
                <Link href="/admin/dashboard">
                  <Button>Dashboard</Button>
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

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden flex flex-col space-y-2 transition-all duration-300 ease-in-out overflow-hidden",
            {
              "max-h-0": !isMenuOpen,
              "max-h-[200px] mt-4": isMenuOpen,
            }
          )}
        >
          {user ? (
            <>
              <Button onClick={handleSignOut} variant="outline" className="w-full">Sign Out</Button>
              <Link href="/admin/new" className="w-full">
                <Button className="w-full">Create Campaign</Button>
              </Link>
            </>
          ) : (
            <Link href="/login" className="w-full">
              <Button className="w-full">Login</Button>
            </Link>
          )}
          <Link href="/campaigns" className="w-full">
            <Button variant="secondary" className="w-full">Generate Letter</Button>
          </Link>
        </div>
      </header>
      <div style={{ height: `${headerHeight}px` }} />
    </>
  )
}