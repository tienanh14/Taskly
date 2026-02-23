'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Task } from '@/lib/types'

interface Props {
    tasks: Task[]
    onResolve: (taskId: string, outcome: 'done' | 'expired') => Promise<void>
}

export function GuardModal({ tasks, onResolve }: Props) {
    const [current, setCurrent] = useState(0)
    const [loading, setLoading] = useState(false)

    const task = tasks[current]

    const handleResolve = useCallback(
        async (outcome: 'done' | 'expired') => {
            setLoading(true)
            await onResolve(task.id, outcome)
            setLoading(false)
            if (current + 1 < tasks.length) {
                setCurrent((c) => c + 1)
            }
        },
        [task, current, tasks.length, onResolve]
    )

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    if (!task) return null

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in" />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-white/20 dark:border-slate-800 shadow-2xl animate-slide-up p-10 text-center">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10">
                    <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shadow-lg shadow-amber-500/10">
                        <span className="material-symbols-outlined text-amber-500 text-[40px] font-black">timer</span>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Time&rsquo;s Up!</h2>
                    <p className="text-slate-400 font-bold text-sm mb-6 uppercase tracking-widest">A session has concluded</p>

                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
                        <p className="text-primary font-black text-xl leading-tight">&ldquo;{task.title}&rdquo;</p>
                    </div>

                    {tasks.length > 1 && (
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">
                            Task {current + 1} of {tasks.length}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            disabled={loading}
                            onClick={() => handleResolve('done')}
                            className="flex-1 h-[56px] rounded-2xl bg-primary text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            Mission Success
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => handleResolve('expired')}
                            className="flex-1 h-[56px] rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-black hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            Needs Review
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
