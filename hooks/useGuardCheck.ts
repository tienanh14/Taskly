'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Task } from '@/lib/types'

const INTERVAL_MS = 60_000 // check every minute

export function useGuardCheck(onOverdue: (tasks: Task[]) => void) {
    const callbackRef = useRef(onOverdue)
    callbackRef.current = onOverdue

    const check = useCallback(async () => {
        try {
            const res = await fetch('/api/tasks/check-overdue')
            if (res.ok) {
                const data = await res.json()
                if (data.tasks && data.tasks.length > 0) {
                    callbackRef.current(data.tasks as Task[])
                }
            }
        } catch (err) {
            console.error('Failed to check overdue tasks:', err)
        }
    }, [])

    useEffect(() => {
        check() // run on mount
        const interval = setInterval(check, INTERVAL_MS)
        return () => clearInterval(interval)
    }, [check])
}
