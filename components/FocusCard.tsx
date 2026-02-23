'use client'

import { useState, useEffect } from 'react'
import type { Task } from '@/lib/types'

interface Props {
    task: Task
    onResolve: (id: string, resolution: 'DONE' | 'EXPIRED') => Promise<void>
    onStop: (id: string) => Promise<void>
}

function formatTime(seconds: number) {
    if (seconds < 0) seconds = 0
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

export function FocusCard({ task, onResolve, onStop }: Props) {
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!task.due_at) return 0
        return Math.floor((new Date(task.due_at).getTime() - Date.now()) / 1000)
    })

    useEffect(() => {
        if (!task.due_at) return
        const initialRemaining = Math.floor((new Date(task.due_at).getTime() - Date.now()) / 1000)
        setTimeLeft(initialRemaining)
        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                const next = prev - 1
                return next < 0 ? 0 : next
            })
        }, 1000)
        return () => clearInterval(timerId)
    }, [task.due_at])

    const isDanger = timeLeft > 0 && timeLeft <= 60

    return (
        <section className="animate-slide-up mb-8 max-w-6xl mx-auto w-full">
            <div className="card-premium rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] translate-y-1/2 -translate-x-1/2 rounded-full"></div>

                <div className="flex flex-col gap-3 w-full md:w-auto relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-primary text-white uppercase tracking-widest shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[14px]">bolt</span>
                            Focus Mode
                        </span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                            {task.title}
                        </h2>
                        <p className="text-slate-400 text-sm font-bold mt-1">
                            Stay focused and complete this task!
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`text-6xl md:text-7xl font-black tabular-nums tracking-tighter transition-all duration-300
                        ${isDanger ? 'text-rose-500 scale-105 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                        {formatTime(timeLeft)}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[3px]">
                        <span className={`w-2 h-2 rounded-full ${timeLeft > 0 ? 'bg-primary animate-ping' : 'bg-slate-300'}`}></span>
                        Time Remaining
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto relative z-10">
                    <button
                        onClick={() => onResolve(task.id, 'DONE')}
                        className="flex-1 md:flex-none h-[56px] min-w-[160px] inline-flex items-center justify-center gap-2 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30"
                    >
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        Mark Done ✨
                    </button>

                    <button
                        onClick={() => onStop(task.id)}
                        className="h-[56px] w-[56px] inline-flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
                        title="Stop Session"
                    >
                        <span className="material-symbols-outlined text-[24px]">stop_circle</span>
                    </button>
                </div>
            </div>
        </section>
    )
}
