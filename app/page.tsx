'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkState() {
      try {
        const res = await fetch('/api/spaces')
        if (res.ok) {
          const spaces = await res.json()
          if (spaces.length > 0 && spaces[0].projects.length > 0) {
            router.push(`/dashboard/${spaces[0].projects[0].id}`)
            return
          }
        }
        // Fallback or no projects: go to dashboard shell
        router.push('/dashboard')
      } catch (err) {
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    checkState()
  }, [router])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
