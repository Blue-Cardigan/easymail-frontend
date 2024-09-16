'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function ClientLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Check if the user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', session.user.id)
          .single()

        if (adminError || !adminData) {
          // If not an admin, sign out and show error
          await supabase.auth.signOut()
          setError('Not authorized. Please contact support if you believe this is an error.')
        } else {
          // If admin, redirect to admin/new
          router.push('/admin/dashboard')
        }
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // The redirection will be handled by the onAuthStateChange listener
    } catch (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Client Login</h1>
        
        <Alert className="mb-6">
          This login is for registered clients only. If you're looking to create a campaign, please contact us.
        </Alert>
        
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Login'}
          </Button>
        </form>

        {error && <Alert variant="destructive" className="mb-6">{error}</Alert>}

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Want to create your own campaign?</p>
            <Link href="/contact">
              <Button variant="outline" className="w-full">Contact Us</Button>
            </Link>
          </div>
          
          <div className="text-center">
            <Link href="/">
              <Button variant="link" className="w-full">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}