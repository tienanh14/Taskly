import { supabase } from './supabase'
import type { TaskStatus } from './types'

/**
 * Start processing a task.
 *
 * Rules:
 * – block mode: only ONE block task may be 'processing' globally at any time.
 * – deadline mode: unlimited concurrent 'processing' tasks allowed.
 */
export async function startTask(taskId: string): Promise<{ error?: string }> {
    const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('id, mode, status, duration_minutes')
        .eq('id', taskId)
        .single()

    if (fetchError || !task) return { error: 'Task not found.' }
    if (task.status === 'processing') return { error: 'Task is already processing.' }
    if (task.status === 'done' || task.status === 'expired') {
        return { error: 'Cannot restart a completed task.' }
    }

    // Enforce global block constraint
    if (task.mode === 'block') {
        const { count } = await supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('mode', 'block')
            .eq('status', 'processing')

        if ((count ?? 0) > 0) {
            return { error: 'Another block task is already in progress. Finish it first.' }
        }
    }

    const updateData: any = {
        status: 'processing',
        started_at: new Date().toISOString()
    }
    if (task.mode === 'block') {
        updateData.due_at = new Date(Date.now() + (task.duration_minutes || 25) * 60000).toISOString()
    }

    const { error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)

    if (updateError) return { error: updateError.message }
    return {}
}

/**
 * Resolve a processing task: 'done' or 'expired'.
 */
export async function resolveTask(
    taskId: string,
    outcome: 'done' | 'expired'
): Promise<{ error?: string }> {
    const { error } = await supabase
        .from('tasks')
        .update({ status: outcome as TaskStatus })
        .eq('id', taskId)

    if (error) return { error: error.message }
    return {}
}

/**
 * Stop (un-start) a task – reset back to 'assigned'.
 */
export async function stopTask(taskId: string): Promise<{ error?: string }> {
    const { data: task } = await supabase.from('tasks').select('mode').eq('id', taskId).single()

    const updateData: any = { status: 'assigned', started_at: null }
    if (task?.mode === 'block') {
        updateData.due_at = null // only clear due_at for block mode
    }

    const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)

    if (error) return { error: error.message }
    return {}
}

/**
 * Find any 'processing' tasks whose due_at has passed.
 */
export async function getOverdueTasks() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'processing')
        .lt('due_at', new Date().toISOString())
        .not('due_at', 'is', null)

    if (error) return []
    return data ?? []
}
