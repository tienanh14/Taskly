'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { GuardModal } from '@/components/GuardModal'
import { useGuardCheck } from '@/hooks/useGuardCheck'
import type { SpaceWithProjects, Task } from '@/lib/types'
import { useParams } from 'next/navigation'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [spaces, setSpaces] = useState<SpaceWithProjects[]>([])
    const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
    const params = useParams()
    const projectId = params?.projectId as string | undefined

    const fetchSpaces = useCallback(async () => {
        const res = await fetch('/api/spaces')
        if (res.ok) {
            const data = await res.json()
            setSpaces(data)
        }
    }, [])

    useEffect(() => {
        fetchSpaces()
    }, [fetchSpaces])

    const handleCreateSpace = async (name: string) => {
        const res = await fetch('/api/spaces', {
            method: 'POST',
            body: JSON.stringify({ name }),
        })
        if (res.ok) fetchSpaces()
    }

    const handleCreateProject = async (spaceId: string, name: string) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            body: JSON.stringify({ space_id: spaceId, name }),
        })
        if (res.ok) fetchSpaces()
    }

    const handleUpdateSpace = async (id: string, name: string) => {
        const res = await fetch(`/api/spaces/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name }),
        })
        if (res.ok) fetchSpaces()
    }

    const handleDeleteSpace = async (id: string) => {
        const res = await fetch(`/api/spaces/${id}`, {
            method: 'DELETE',
        })
        if (res.ok) fetchSpaces()
    }

    const handleUpdateProject = async (id: string, name: string) => {
        const res = await fetch(`/api/projects/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name }),
        })
        if (res.ok) fetchSpaces()
    }

    const handleDeleteProject = async (id: string) => {
        const res = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
        })
        if (res.ok) {
            fetchSpaces()
            if (projectId === id) {
                // Redirect if we are on the deleted project
                window.location.href = '/dashboard'
            }
        }
    }

    const handleResolveTask = async (taskId: string, outcome: 'done' | 'expired') => {
        const res = await fetch(`/api/tasks/${taskId}/action`, {
            method: 'POST',
            body: JSON.stringify({ action: outcome }),
        })
        if (res.ok) {
            setOverdueTasks((prev) => prev.filter((t) => t.id !== taskId))
            // Force refresh of current page data - handled by children usually, 
            // but if we had a global state we'd refresh it here.
            window.dispatchEvent(new Event('task-updated'))
        }
    }

    useGuardCheck((tasks) => {
        setOverdueTasks(tasks)
    })

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar
                spaces={spaces}
                activeProjectId={projectId}
                onCreateSpace={handleCreateSpace}
                onCreateProject={handleCreateProject}
                onUpdateSpace={handleUpdateSpace}
                onDeleteSpace={handleDeleteSpace}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
            />

            <main className="flex-1 flex flex-col min-w-0 relative">
                {children}
            </main>

            {overdueTasks.length > 0 && (
                <GuardModal
                    tasks={overdueTasks}
                    onResolve={handleResolveTask}
                />
            )}
        </div>
    )
}
