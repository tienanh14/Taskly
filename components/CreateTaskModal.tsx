'use client'
import React, { useState, useEffect } from 'react'
import type { Task, TaskType, TaskMode, Project } from '@/lib/types'

interface Props {
    project: Project
    task?: Task | null
    onClose: () => void
    onCreated: () => void
}

const TYPE_OPTIONS: { value: TaskType; label: string; icon: string; desc: string }[] = [
    { value: 'CONTENT', label: 'Content', icon: 'description', desc: 'Create a Google Doc' },
    { value: 'MEDIA', label: 'Media', icon: 'movie', desc: 'Upload images or video' },
    { value: 'RESOURCE', label: 'Resource', icon: 'link', desc: 'Link to external tool' },
    { value: 'REMINDER', label: 'Reminder', icon: 'notifications', desc: 'General task check' },
]

export function CreateTaskModal({ project, task, onClose, onCreated }: Props) {
    const isEdit = Boolean(task)
    const [loading, setLoading] = useState(false)

    const formatToLocalISO = (dateStr: string | null) => {
        try {
            if (!dateStr) return ''
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return ''
            const offset = date.getTimezoneOffset() * 60000
            return new Date(date.getTime() - offset).toISOString().slice(0, 16)
        } catch (e) {
            console.error('[Task Modal] Date format error:', e)
            return ''
        }
    }

    const [deadlineDate, setDeadlineDate] = useState(formatToLocalISO(task?.due_at || null))
    const [blockHours, setBlockHours] = useState(task?.duration_minutes ? Math.floor(task.duration_minutes / 60) : 0)
    const [blockMinutes, setBlockMinutes] = useState(task?.duration_minutes ? task.duration_minutes % 60 : 25)

    const [formData, setFormData] = useState({
        title: task?.title || '',
        type: task?.type || ('REMINDER' as TaskType),
        mode: task?.mode || ('deadline' as TaskMode),
        priority: task?.priority || 2,
        reference_link: task?.reference_link || '',
    })

    const setQuickDeadline = (type: 'today' | 'tomorrow' | 'next-week') => {
        const d = new Date()
        d.setMinutes(0)
        d.setSeconds(0)
        d.setMilliseconds(0)

        if (type === 'today') {
            d.setHours(d.getHours() + 4) // +4 hours from now
        } else if (type === 'tomorrow') {
            d.setDate(d.getDate() + 1)
            d.setHours(9) // 9 AM tomorrow
        } else if (type === 'next-week') {
            d.setDate(d.getDate() + 7)
            d.setHours(9)
        }
        setDeadlineDate(formatToLocalISO(d.toISOString()))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const isBlock = formData.mode === 'block'
        const duration_minutes = isBlock ? blockHours * 60 + blockMinutes : null
        const due_at = !isBlock && deadlineDate ? new Date(deadlineDate).toISOString() : null

        const url = isEdit ? `/api/tasks/${task!.id}` : '/api/tasks'
        const method = isEdit ? 'PATCH' : 'POST'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: project.id,
                    title: formData.title,
                    type: formData.type,
                    mode: formData.mode,
                    priority: formData.priority,
                    reference_link: formData.reference_link || null,
                    due_at,
                    duration_minutes,
                }),
            })

            if (res.ok) {
                onCreated()
                onClose()
            } else {
                const data = await res.json()
                alert(`Error: ${data.error || 'Failed to process'}`)
            }
        } catch (err: any) {
            alert('A network error occurred.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!task || !confirm('Permanently delete this task and its Drive files?')) return
        setLoading(true)
        const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
        if (res.ok) {
            onCreated()
            onClose()
        } else alert('Delete failed')
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 animate-slide-up">
                {/* Header Backdrop */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

                <div className="relative p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-primary font-bold text-xs uppercase tracking-widest">{project.name}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">{isEdit ? 'Revision' : 'Initialization'}</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                {isEdit ? 'Modify Task' : 'Compose Task'}
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined text-[24px]">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Title Input - Huge & Modern */}
                        <div className="space-y-2">
                            <input
                                autoFocus
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-transparent text-2xl md:text-3xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none focus:ring-0 border-b-2 border-slate-100 dark:border-slate-800 focus:border-primary transition-all pb-4"
                                placeholder="What's the objective?"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Left Column: Configuration */}
                            <div className="space-y-6">
                                {/* Task Type Selector */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Task Category</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {TYPE_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                disabled={isEdit}
                                                onClick={() => setFormData({ ...formData, type: opt.value })}
                                                className={`flex flex-col items-start p-3 rounded-2xl border-2 text-left transition-all ${formData.type === opt.value
                                                        ? 'bg-primary/5 border-primary shadow-sm'
                                                        : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-primary/30 opacity-70 hover:opacity-100'
                                                    } ${isEdit && formData.type !== opt.value ? 'hidden' : ''} ${isEdit ? 'w-full grid-cols-1' : ''}`}
                                            >
                                                <span className={`material-symbols-outlined text-[20px] mb-2 ${formData.type === opt.value ? 'text-primary' : 'text-slate-400'}`}>
                                                    {opt.icon}
                                                </span>
                                                <span className={`text-[13px] font-bold ${formData.type === opt.value ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                                    {opt.label}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{opt.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Priority Selector */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Urgency Level</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                                        {[
                                            { v: 1, l: 'High', c: 'text-rose-500' },
                                            { v: 2, l: 'Medium', c: 'text-amber-500' },
                                            { v: 3, l: 'Low', c: 'text-emerald-500' },
                                        ].map((p) => (
                                            <button
                                                key={p.v}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p.v as any })}
                                                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${formData.priority === p.v ? 'bg-white dark:bg-slate-700 shadow-sm ' + p.c : 'text-slate-400 hover:text-slate-600'
                                                    }`}
                                            >
                                                {p.l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Scheduling */}
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Scheduling Strategy</label>
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, mode: 'deadline' })}
                                                className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${formData.mode === 'deadline' ? 'bg-primary text-white border-primary' : 'text-slate-400 border-slate-200 dark:border-slate-800'
                                                    }`}
                                            >
                                                Deadline
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, mode: 'block' })}
                                                className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${formData.mode === 'block' ? 'bg-primary text-white border-primary' : 'text-slate-400 border-slate-200 dark:border-slate-800'
                                                    }`}
                                            >
                                                Time Block
                                            </button>
                                        </div>
                                    </div>

                                    {formData.mode === 'deadline' ? (
                                        <div className="space-y-4 animate-fade-in">
                                            {/* Smart Presets */}
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuickDeadline('today')}
                                                    className="px-3 py-1.5 text-[11px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:border-primary transition-all"
                                                >
                                                    Today
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setQuickDeadline('tomorrow')}
                                                    className="px-3 py-1.5 text-[11px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:border-primary transition-all"
                                                >
                                                    Tomorrow
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setQuickDeadline('next-week')}
                                                    className="px-3 py-1.5 text-[11px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:border-primary transition-all"
                                                >
                                                    Next Week
                                                </button>
                                            </div>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[20px]">calendar_today</span>
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    value={deadlineDate}
                                                    onChange={(e) => setDeadlineDate(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-12 py-3.5 text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Hours</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={blockHours}
                                                    onChange={(e) => setBlockHours(parseInt(e.target.value) || 0)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-lg font-black text-center text-slate-700 dark:text-white focus:outline-none focus:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Minutes</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={blockMinutes}
                                                    onChange={(e) => setBlockMinutes(parseInt(e.target.value) || 0)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-lg font-black text-center text-slate-700 dark:text-white focus:outline-none focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Resource Link */}
                                {(formData.type === 'RESOURCE' || formData.type === 'CONTENT') && (
                                    <div className="animate-fade-in pt-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">Supporting Asset Link</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">link</span>
                                            <input
                                                required={formData.type === 'RESOURCE'}
                                                type="url"
                                                value={formData.reference_link}
                                                onChange={(e) => setFormData({ ...formData, reference_link: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-12 py-3 text-xs font-bold text-slate-700 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary transition-all"
                                                placeholder="https://paste-link-here.com"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6">
                            {isEdit && (
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleDelete}
                                    className="px-6 py-4 border border-rose-500/20 text-rose-500 font-bold rounded-2xl hover:bg-rose-500/5 transition-all text-sm flex items-center gap-2 group disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">delete</span>
                                    <span>Discard</span>
                                </button>
                            )}
                            <button
                                disabled={loading}
                                type="submit"
                                className="flex-1 py-4 bg-primary hover:bg-blue-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 text-base flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[22px]">{isEdit ? 'save' : 'done_all'}</span>
                                        <span>{isEdit ? 'Commit Changes' : 'Initialize Task'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
