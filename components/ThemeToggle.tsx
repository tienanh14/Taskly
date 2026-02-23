'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Wait until mounted on client to avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="p-2 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse opacity-50" />
        )
    }

    const isDark = theme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all flex items-center justify-center group"
            aria-label="Toggle Theme"
        >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                {isDark ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    )
}
