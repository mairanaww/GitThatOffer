'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallback() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.replace('/')
      return
    }

    // Check profile completion without showing any UI flash
    const checkAndRedirect = async () => {
      try {
        const response = await fetch('/api/user/profile')
        
        if (response.ok) {
          const userData = await response.json()
          if (userData.isComplete) {
            router.replace('/dashboard')
          } else {
            router.replace('/setup')
          }
        } else {
          // Profile doesn't exist, go to setup
          router.replace('/setup')
        }
      } catch (error) {
        console.error('Error checking profile:', error)
        router.replace('/setup')
      }
    }

    checkAndRedirect()
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-[#111020] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
        <p className="mt-4 text-xl text-gray-200">Loading your profile...</p>
      </div>
    </div>
  )
}
