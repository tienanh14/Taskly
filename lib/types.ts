// ─── Supabase DB Types ────────────────────────────────────────────────────────

export type TaskType = 'CONTENT' | 'MEDIA' | 'RESOURCE' | 'REMINDER'
export type TaskStatus = 'assigned' | 'processing' | 'done' | 'expired'
export type TaskMode = 'block' | 'deadline'

export interface Space {
    id: string
    name: string
    color_dot: string
    created_at: string
}

export interface Project {
    id: string
    space_id: string
    name: string
    drive_folder_id: string | null
    created_at: string
}

export interface Task {
    id: string
    project_id: string
    title: string
    type: TaskType
    status: TaskStatus
    mode: TaskMode
    priority: 1 | 2 | 3
    reference_link: string | null
    drive_link: string | null
    duration_minutes: number | null
    due_at: string | null
    started_at: string | null
    created_at: string
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export interface SpaceWithProjects extends Space {
    projects: Project[]
}
