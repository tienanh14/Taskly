'use client'

import type { Task } from '@/lib/types'
import { useState } from 'react'

interface Props {
    tasks: Task[]
    onStart: (id: string, mode: 'deadline' | 'block', endTime: string | null) => Promise<void>
    onStop: (id: string) => Promise<void>
    onResolve: (id: string, resolution: 'DONE' | 'EXPIRED') => Promise<void>
    onUpload: (id: string, file: File) => Promise<void>
    onEdit: (task: Task) => void
}

function getStatusBadge(status: string) {
    const baseClass = "h-5 w-5 shrink-0 aspect-square rounded-full border-2 flex items-center justify-center overflow-hidden"

    if (status === 'processing') {
        return (
            <div className={`${baseClass} border-primary`}>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            </div>
        )
    }
    if (status === 'done') {
        return (
            <div className={`${baseClass} border-green-500 bg-green-50 dark:bg-green-900/20`}>
                <span className="material-symbols-outlined text-[7px] text-green-500 font-black translate-y-[0.5px] leading-none select-none">check</span>
            </div>
        )
    }
    if (status === 'expired') {
        return (
            <div className={`${baseClass} border-rose-400 bg-rose-50 dark:bg-rose-900/20`}>
                <span className="material-symbols-outlined text-[7px] text-rose-500 font-black leading-none select-none">close</span>
            </div>
        )
    }
    return <div className={`${baseClass} border-slate-200 dark:border-slate-700`}></div>
}

function StatusDropdown({ status, onChange }: { status: string, onChange: (val: string) => void }) {
    let colorClass = 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    if (status === 'processing') colorClass = 'text-primary bg-primary/10 border-primary/20'
    else if (status === 'done') colorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/20'
    else if (status === 'expired') colorClass = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-500/20'

    return (
        <select
            value={status}
            onChange={(e) => onChange(e.target.value)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-center outline-none transition-all ${colorClass}`}
        >
            <option value="assigned">Assigned</option>
            <option value="processing">Processing</option>
            <option value="done">Done</option>
            <option value="expired">Expired</option>
        </select>
    )
}

function formatDuration(minutes: number | null) {
    if (!minutes) return '—'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0 && m > 0) return `${h}h ${m}m`
    if (h > 0) return `${h}h`
    return `${m}m`
}

function formatDeadline(dateStr: string | null) {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    const now = new Date()

    const isToday = date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow = date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear()

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    if (isToday) return `${timeStr} Today`
    if (isTomorrow) return `${timeStr} Tomorrow`

    return `${timeStr} - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function getModeBadge(mode: string) {
    if (mode === 'block') {
        return <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 uppercase">Block</span>
    }
    return <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 uppercase">Deadline</span>
}

function getPriorityBadge(priority: number) {
    switch (priority) {
        case 1:
            return <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase">High</span>
        case 2:
            return <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">Med</span>
        default:
            return <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">Low</span>
    }
}

function getOutputActionButton(task: Task, onUpload: (id: string, file: File) => Promise<void>, uploadingId: string | null) {
    const hasDriveLink = !!task.drive_link
    const hasRefLink = !!task.reference_link

    const btnClass = "flex items-center justify-center gap-1.5 w-[90px] h-[34px] rounded-full border border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 transition-all group"

    if (task.type === 'CONTENT' && (hasDriveLink || hasRefLink)) {
        const isDrive = hasDriveLink
        return (
            <a href={(task.drive_link || task.reference_link)!} target="_blank" rel="noreferrer" className={btnClass}>
                <span className={`material-symbols-outlined text-[15px] ${isDrive ? 'text-blue-500' : 'text-slate-400'}`}>link</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Docs</span>
            </a>
        )
    }

    if (task.type === 'RESOURCE' && task.reference_link) {
        return (
            <a href={task.reference_link} target="_blank" rel="noreferrer" className={btnClass}>
                <span className="material-symbols-outlined text-slate-400 text-[15px]">link</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Link</span>
            </a>
        )
    }

    if (task.type === 'MEDIA') {
        const hasDrive = !!task.drive_link
        const isUploading = uploadingId === task.id

        if (hasDrive) {
            return (
                <a href={task.drive_link!} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 w-[90px] h-[34px] rounded-full border border-dashed transition-all border-emerald-500/30 bg-emerald-50/5">
                    <span className="material-symbols-outlined text-[15px] text-emerald-500">cloud_done</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-emerald-600 dark:text-emerald-400">Final</span>
                </a>
            )
        }

        return (
            <div
                onClick={() => {
                    if (!isUploading) {
                        const input = document.getElementById(`upload-${task.id}`) as HTMLInputElement
                        input?.click()
                    }
                }}
                className={`flex items-center justify-center gap-1.5 w-[90px] h-[34px] rounded-full border border-dashed transition-all cursor-pointer border-slate-300 dark:border-slate-700 hover:border-primary/50 group ${isUploading ? 'opacity-50' : ''}`}
            >
                <input
                    type="file"
                    id={`upload-${task.id}`}
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onUpload(task.id, file)
                    }}
                />
                <span className={`material-symbols-outlined text-[15px] ${isUploading ? 'animate-spin' : 'text-slate-400 group-hover:text-primary'}`}>
                    {isUploading ? 'refresh' : 'cloud_upload'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500 dark:text-slate-400 group-hover:text-primary">
                    {isUploading ? '...' : 'Upload'}
                </span>
            </div>
        )
    }

    return (
        <div className="flex justify-center opacity-20">
            <span className="material-symbols-outlined text-[16px] text-slate-400">remove</span>
        </div>
    )
}

export function TaskTable({ tasks, onStart, onStop, onResolve, onUpload, onEdit }: Props) {
    const handleEdit = (task: Task) => onEdit?.(task)
    const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({ processing: false, todo: false, done: false })
    const [uploadingId, setUploadingId] = useState<string | null>(null)

    const handleUploadProxy = async (id: string, file: File) => {
        setUploadingId(id)
        try { await onUpload(id, file) } finally { setUploadingId(null) }
    }

    const handleStatusChange = async (task: Task, newStatus: string) => {
        if (task.status === newStatus) return
        if (newStatus === 'processing') await onStart(task.id, task.mode, null)
        else if (newStatus === 'assigned') await onStop(task.id)
        else if (newStatus === 'done' || newStatus === 'expired') await onResolve(task.id, newStatus.toUpperCase() as any)
    }

    const renderRow = (t: Task) => {
        const isProcessing = t.status === 'processing'
        const isDone = t.status === 'done' || t.status === 'expired'

        return (
            <tr key={t.id} className={`group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isProcessing ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3 text-center w-[50px]">
                    <div className="flex justify-center">{getStatusBadge(t.status)}</div>
                </td>
                <td className="px-4 py-3 min-w-[200px]">
                    <div className={`font-semibold text-[13px] truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {t.title}
                    </div>
                </td>
                <td className="px-4 py-3 text-center w-[120px]">
                    <div className="flex justify-center">{getPriorityBadge(t.priority)}</div>
                </td>
                <td className="px-4 py-3 text-center w-[140px]">
                    <StatusDropdown status={t.status} onChange={(v) => handleStatusChange(t, v)} />
                </td>
                <td className="px-4 py-3 w-[220px]">
                    <div className="flex items-center gap-2.5">
                        {getModeBadge(t.mode)}
                        <div className="text-[11px] font-medium text-slate-500">
                            {t.mode === 'block' ? (
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span>{formatDuration(t.duration_minutes)}</span>
                            ) : (
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">event</span>{formatDeadline(t.due_at)}</span>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3 text-center w-[120px]">
                    <div className="flex justify-center">{getOutputActionButton(t, handleUploadProxy, uploadingId)}</div>
                </td>
                <td className="pr-6 py-3 text-right w-[60px]">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(t); }}
                        className="p-2 text-slate-300 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-slate-100"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                </td>
            </tr>
        )
    }

    const renderSection = (title: string, count: number, sectionTasks: Task[], sectionKey: string) => {
        const isCollapsed = collapsed[sectionKey]
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 cursor-pointer select-none group w-fit px-2" onClick={() => setCollapsed(p => ({ ...p, [sectionKey]: !isCollapsed }))}>
                    <span className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>expand_more</span>
                    <h3 className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                        {title} <span className="text-slate-400 font-medium ml-1">({count})</span>
                    </h3>
                </div>

                {!isCollapsed && (
                    <div className="card-premium rounded-[24px] overflow-hidden">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50/50 dark:bg-white/5 border-b border-slate-50 dark:border-slate-800">
                                    <th className="px-4 py-3 w-[50px]"></th>
                                    <th className="px-4 py-3">Task Name</th>
                                    <th className="px-4 py-3 text-center w-[120px]">Priority</th>
                                    <th className="px-4 py-3 text-center w-[140px]">Status</th>
                                    <th className="px-4 py-3 w-[220px]">Schedule</th>
                                    <th className="px-4 py-3 text-center w-[120px]">Output</th>
                                    <th className="pr-6 py-3 w-[60px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                                {sectionTasks.length > 0 ? (
                                    sectionTasks.map(renderRow)
                                ) : (
                                    <tr><td colSpan={7} className="py-10 text-center text-slate-400 text-sm italic">No tasks in this section.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )
    }

    const processing = tasks.filter(t => t.status === 'processing')
    const todo = tasks.filter(t => t.status === 'assigned')
    const done = tasks.filter(t => t.status === 'done' || t.status === 'expired')

    return (
        <div className="space-y-10 animate-fade-in py-4 pb-20">
            {renderSection('In Progress', processing.length, processing, 'processing')}

            {renderSection('To Do', todo.length, todo, 'todo')}
            {renderSection('Completed', done.length, done, 'done')}
        </div>
    )
}
