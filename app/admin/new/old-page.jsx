// 'use client'

// import { useRouter } from 'next/navigation'
// import { useEffect, useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Alert } from '@/components/ui/alert'

// export default function NewCampaign() {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(true)
//   const [isAuthorized, setIsAuthorized] = useState(false)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     function checkAuthorization() {
//       try {
//         // Check for the isLoggedIn cookie
//         const isLoggedIn = document.cookie.split('; ').find(row => row.startsWith('isLoggedIn='))?.split('=')[1] === 'true'

//         if (!isLoggedIn) {
//           router.push('/login')
//           return
//         }

//         // For now, we'll consider the user authorized if they're logged in
//         setIsAuthorized(true)
//       } catch (error) {
//         console.error('Authorization check failed:', error)
//         setError('Failed to verify authorization. Please try again.')
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     checkAuthorization()
//   }, [router])

//   const handleCreateCampaign = () => {
//     const newId = Math.random().toString(36).substr(2, 9)
//     router.push(`/admin/${newId}`)
//   }

//   if (isLoading) {
//     return <div>Checking authorization...</div>
//   }

//   if (error) {
//     return <Alert variant="destructive">{error}</Alert>
//   }

//   if (!isAuthorized) {
//     return <Alert>You are not authorized to create a new campaign.</Alert>
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Create New Campaign</h1>
//       <Button onClick={handleCreateCampaign}>Create Campaign</Button>
//     </div>
//   )
// }