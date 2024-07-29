'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    // Hardcoded admin credentials
    const adminEmail = 'admin@test.com'
    const adminPassword = 'password'

    if (email === adminEmail && password === adminPassword) {
      // Simulate successful login
      // In the handleLogin function, replace localStorage.setItem with:
      document.cookie = 'isLoggedIn=true; path=/; max-age=3600'; // expires in 1 hour
      router.push('/admin/new')
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
          <Button type="submit" className="w-full">Login</Button>
        </form>
        {error && <Alert variant="destructive" className="mt-4">{error}</Alert>}
      </div>
    </div>
  )
}