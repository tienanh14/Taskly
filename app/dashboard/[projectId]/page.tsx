'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { FocusCard } from '@/components/FocusCard'
import { TaskTable } from '@/components/TaskTable'
import { CreateTaskModal } from '@/components/CreateTaskModal'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { Task, Project } from '@/lib/types'

export default function ProjectPage() {
    const params = useParams()
    const projectId = params?.projectId as string

    const [project, setProject] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    const fetchProjectData = useCallback(async () => {
        if (!projectId) return
        setLoading(true)
        await fetch('/api/tasks/check-overdue')
        const tasksRes = await fetch(`/api/tasks?project_id=${projectId}`)
        if (tasksRes.ok) {
            const tasksData = await tasksRes.json()
            setTasks(tasksData)
        }
        const spacesRes = await fetch('/api/spaces')
        if (spacesRes.ok) {
            const spaces = await spacesRes.json()
            for (const space of spaces) {
                const found = space.projects.find((p: Project) => p.id === projectId)
                if (found) {
                    setProject(found)
                    break
                }
            }
        }
        setLoading(false)
    }, [projectId])

    useEffect(() => { fetchProjectData() }, [fetchProjectData])
    useEffect(() => {
        const handleUpdate = () => fetchProjectData()
        window.addEventListener('task-updated', handleUpdate)
        return () => window.removeEventListener('task-updated', handleUpdate)
    }, [fetchProjectData])

    const handleStart = async (id: string, mode: 'deadline' | 'block', endTime: string | null) => {
        const res = await fetch(`/api/tasks/${id}/action`, {
            method: 'POST', body: JSON.stringify({ action: 'start' })
        })
        if (res.ok) fetchProjectData()
    }
    const handleStop = async (id: string) => {
        const res = await fetch(`/api/tasks/${id}/action`, {
            method: 'POST', body: JSON.stringify({ action: 'stop' })
        })
        if (res.ok) fetchProjectData()
    }
    const handleResolve = async (id: string, resolution: 'DONE' | 'EXPIRED') => {
        const res = await fetch(`/api/tasks/${id}/action`, {
            method: 'POST', body: JSON.stringify({ action: resolution.toLowerCase() })
        })
        if (res.ok) fetchProjectData()
    }
    const handleUpload = async (taskId: string, file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('taskId', taskId)
        const res = await fetch('/api/tasks/upload', {
            method: 'POST', body: formData
        })
        if (res.ok) fetchProjectData()
    }

    const processingBlockTask = useMemo(() => {
        return tasks.find(t => t.mode === 'block' && t.status === 'processing')
    }, [tasks])

    if (loading && !project) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background-light dark:bg-background-dark">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Project Not Found</h1>
                <p className="text-slate-500 font-bold">Please select a project from the sidebar.</p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
            <header className="glass-header sticky top-0 z-30 border-b border-slate-100 dark:border-slate-800 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-8 flex-1 max-w-2xl">
                    <div className="flex flex-col">
                        <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">{project.name}</h1>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tasks.length} Tasks</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setEditingTask(null); setShowCreateModal(true); }}
                        className="bg-primary text-white font-black py-2.5 px-6 rounded-2xl text-[13px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px] font-black">add</span>
                        Create Task
                    </button>
                    <div className="flex items-center gap-2 p-1 bg-slate-100/50 dark:bg-white/5 rounded-2xl">
                        <ThemeToggle />
                        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 overflow-hidden shadow-sm">
                        <img className="w-full h-full object-cover rounded-[14px]" alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPo0KeuuI2zpAaIke4q5nrPU0JWqqh7MQs-ArwbBnDwqJ-mKyvQGUtkpGxqcqZMt7LtqKvY7zNA7SopezVmQat7aYKOzGYtM0dS7JRSjr0mnSpFvbLYzDIyQ05_BfntcNz5cdDm7gse6YT-Lr7D7j2MpxJ90yMsqQyunZVh_iHNVjC3BMrVD0msokjvTPVeTirccUr1zTp9iB61OAzuGlbYKpgdJ5EIhm5XhPiJQcyxrqDTOvVJ0RzjG2kVta4vO-ydc2RkKIl23Wy" />
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto w-full space-y-8 animate-fade-in">
                    {processingBlockTask && (
                        <FocusCard
                            task={processingBlockTask}
                            onResolve={handleResolve}
                            onStop={handleStop}
                        />
                    )}

                    <TaskTable
                        tasks={tasks}
                        onStart={handleStart}
                        onStop={handleStop}
                        onResolve={handleResolve}
                        onUpload={handleUpload}
                        onEdit={(task) => {
                            setEditingTask(task)
                            setShowCreateModal(true)
                        }}
                    />
                </div>
            </main>

            {showCreateModal && (
                <CreateTaskModal
                    project={project}
                    task={editingTask}
                    onClose={() => {
                        setShowCreateModal(false)
                        setEditingTask(null)
                    }}
                    onCreated={fetchProjectData}
                />
            )}
        </div>
    )
}
