'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import type { SpaceWithProjects } from '@/lib/types'

interface Props {
    spaces: SpaceWithProjects[]
    activeProjectId?: string
    onCreateSpace: (name: string) => Promise<void>
    onCreateProject: (spaceId: string, name: string) => Promise<void>
    onUpdateSpace: (id: string, name: string) => Promise<void>
    onDeleteSpace: (id: string) => Promise<void>
    onUpdateProject: (id: string, name: string) => Promise<void>
    onDeleteProject: (id: string) => Promise<void>
}

const ICONS = ['category', 'person', 'rocket_launch', 'data_usage', 'explore', 'star', 'workspaces']

export function Sidebar({
    spaces,
    activeProjectId,
    onCreateSpace,
    onCreateProject,
    onUpdateSpace,
    onDeleteSpace,
    onUpdateProject,
    onDeleteProject
}: Props) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})
    const [addingSpace, setAddingSpace] = useState(false)
    const [spaceName, setSpaceName] = useState('')
    const [addingProject, setAddingProject] = useState<string | null>(null)
    const [projectName, setProjectName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [menuOpen, setMenuOpen] = useState<{ type: 'space' | 'project', id: string } | null>(null)
    const [editing, setEditing] = useState<{ type: 'space' | 'project', id: string, name: string } | null>(null)

    const toggleSpace = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

    const handleAddSpace = async () => {
        if (!spaceName.trim() || isSubmitting) return
        setIsSubmitting(true)
        try {
            await onCreateSpace(spaceName.trim())
            setSpaceName('')
            setAddingSpace(false)
        } finally { setIsSubmitting(false) }
    }

    const handleAddProject = async (spaceId: string) => {
        if (!projectName.trim() || isSubmitting) return
        setIsSubmitting(true)
        try {
            await onCreateProject(spaceId, projectName.trim())
            setProjectName('')
            setAddingProject(null)
        } finally { setIsSubmitting(false) }
    }

    const handleUpdate = async () => {
        if (!editing || !editing.name.trim()) return
        if (editing.type === 'space') await onUpdateSpace(editing.id, editing.name.trim())
        else await onUpdateProject(editing.id, editing.name.trim())
        setEditing(null)
    }

    const handleDelete = async (type: 'space' | 'project', id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${type} "${name}"?`)) return
        if (type === 'space') await onDeleteSpace(id)
        else await onDeleteProject(id)
        setMenuOpen(null)
    }

    // Close menu when clicking outside
    useEffect(() => {
        const handleClick = () => setMenuOpen(null)
        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [])

    return (
        <aside className="w-64 shrink-0 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl flex flex-col h-full relative z-40">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-white text-[20px] font-black">task_alt</span>
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Taskly</h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar">
                <div>
                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all ${!activeProjectId
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        <span>All Tasks</span>
                    </Link>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Spaces</p>
                        <button onClick={() => setAddingSpace(true)} className="text-slate-300 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        </button>
                    </div>

                    <div className="space-y-1">
                        {spaces.map((space, idx) => {
                            const isOpen = expanded[space.id] !== false
                            const spaceIcon = ICONS[idx % ICONS.length]
                            const isMenuOpen = menuOpen?.type === 'space' && menuOpen.id === space.id

                            return (
                                <div key={space.id} className="group/space space-y-1 relative">
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => toggleSpace(space.id)}
                                            className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-2xl text-[13px] font-bold transition-all min-w-0
                                                ${isOpen ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="material-symbols-outlined text-[18px]" style={{ color: space.color_dot }}>{spaceIcon}</span>
                                                <span className="truncate">{space.name}</span>
                                            </div>
                                            <span className={`material-symbols-outlined text-[16px] text-slate-300 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                                                chevron_right
                                            </span>
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setMenuOpen(isMenuOpen ? null : { type: 'space', id: space.id }) }}
                                                className={`p-1 opacity-0 group-hover/space:opacity-100 transition-opacity text-slate-300 hover:text-primary ${isMenuOpen ? 'opacity-100' : ''}`}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                            </button>

                                            {isMenuOpen && (
                                                <div className="absolute right-0 top-7 z-50 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 py-1.5 animate-fade-in text-left">
                                                    <button onClick={() => { setAddingProject(space.id); setMenuOpen(null) }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/5 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px]">add</span> Project
                                                    </button>
                                                    <div className="h-px bg-slate-50 dark:bg-slate-700 my-1 mx-2" />
                                                    <button onClick={() => { setEditing({ type: 'space', id: space.id, name: space.name }); setMenuOpen(null) }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px]">edit</span> Rename
                                                    </button>
                                                    <button onClick={() => handleDelete('space', space.id, space.name)} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="ml-6 pl-4 border-l-2 border-slate-50 dark:border-slate-700 space-y-1 py-1">
                                            {space.projects?.map((proj) => {
                                                const isActive = activeProjectId === proj.id
                                                const isProjMenuOpen = menuOpen?.type === 'project' && menuOpen.id === proj.id

                                                return (
                                                    <div key={proj.id} className="group/project relative flex items-center min-w-0 pr-1">
                                                        <Link
                                                            href={`/dashboard/${proj.id}`}
                                                            className={`flex-1 block px-3 py-2 rounded-xl text-[13px] font-bold transition-all truncate min-w-0
                                                                ${isActive ? 'text-primary bg-primary/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                                        >
                                                            {proj.name}
                                                        </Link>

                                                        <div className="relative shrink-0">
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(isProjMenuOpen ? null : { type: 'project', id: proj.id }) }}
                                                                className={`p-1 opacity-0 group-hover/project:opacity-100 transition-opacity text-slate-300 hover:text-primary ${isProjMenuOpen ? 'opacity-100' : ''}`}
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">more_vert</span>
                                                            </button>

                                                            {isProjMenuOpen && (
                                                                <div className="absolute right-0 top-7 z-50 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 py-1.5 animate-fade-in text-left">
                                                                    <button onClick={() => { setEditing({ type: 'project', id: proj.id, name: proj.name }); setMenuOpen(null) }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">
                                                                        <span className="material-symbols-outlined text-[16px]">edit</span> Rename
                                                                    </button>
                                                                    <button onClick={() => handleDelete('project', proj.id, proj.name)} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2">
                                                                        <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </nav>

            {/* Editing Logic (Global Modals) */}
            {editing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 w-full max-w-[300px] shadow-2xl border border-slate-100 dark:border-slate-800">
                        <h2 className="text-sm font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tight">Rename {editing.type}</h2>
                        <input
                            autoFocus
                            value={editing.name}
                            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3.5 py-2.5 text-xs font-bold mb-4 focus:ring-2 focus:ring-primary/20 outline-none text-slate-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setEditing(null)} className="flex-1 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleUpdate} className="flex-1 py-2 bg-primary text-white text-[11px] font-black rounded-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="p-6">
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 flex items-center gap-3 transition-all border border-transparent shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12px] font-black text-slate-900 dark:text-white truncate">User Account</p>
                        <p className="text-[10px] font-bold text-slate-400">Pro Member</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-[18px] ml-auto">settings</span>
                </div>
            </div>

            {/* Modals for creating */}
            {addingSpace && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 w-full max-w-[300px] shadow-2xl border border-slate-100 dark:border-slate-800">
                        <h2 className="text-sm font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tight">New Space</h2>
                        <input
                            autoFocus
                            value={spaceName}
                            onChange={(e) => setSpaceName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSpace()}
                            placeholder="Type a name..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3.5 py-2.5 text-xs font-bold mb-4 focus:ring-2 focus:ring-primary/20 outline-none text-slate-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setAddingSpace(false)} className="flex-1 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleAddSpace} className="flex-1 py-2 bg-primary text-white text-[11px] font-black rounded-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all">Create</button>
                        </div>
                    </div>
                </div>
            )}

            {addingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 w-full max-w-[300px] shadow-2xl border border-slate-100 dark:border-slate-800">
                        <h2 className="text-sm font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tight">New Project</h2>
                        <input
                            autoFocus
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddProject(addingProject)}
                            placeholder="Type a name..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3.5 py-2.5 text-xs font-bold mb-4 focus:ring-2 focus:ring-primary/20 outline-none text-slate-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setAddingProject(null)} className="flex-1 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Cancel</button>
                            <button onClick={() => handleAddProject(addingProject)} className="flex-1 py-2 bg-primary text-white text-[11px] font-black rounded-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all">Create Project</button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}
