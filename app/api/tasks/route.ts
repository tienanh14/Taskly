import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createGoogleDoc, parseFolderIds } from '@/lib/google-drive'
import type { TaskType, TaskMode } from '@/lib/types'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('project_id')

    let query = supabaseAdmin.from('tasks').select('*').order('created_at', { ascending: false })
    if (projectId) query = query.eq('project_id', projectId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            project_id,
            title,
            type,
            mode,
            priority,
            reference_link,
            duration_minutes,
            due_at,
        } = body as {
            project_id: string
            title: string
            type: TaskType
            mode: TaskMode
            priority: 1 | 2 | 3
            reference_link?: string
            duration_minutes?: number
            due_at?: string
        }

        if (!project_id || !title || !type || !mode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        let drive_link: string | null = null

        // CONTENT: auto-create a Google Doc
        if (type === 'CONTENT') {
            try {
                const { data: project } = await supabaseAdmin
                    .from('projects')
                    .select('drive_folder_id, name')
                    .eq('id', project_id)
                    .single()

                if (project) {
                    const { docsFolderId } = parseFolderIds(project.drive_folder_id)
                    if (docsFolderId) {
                        drive_link = await createGoogleDoc(docsFolderId, title)
                    }
                }
            } catch (driveError: any) {
                console.error('[Task API] Google Drive integration failed:', driveError.message)
                // We continue task creation even if Drive fails, or you could return error here.
                // For now, let's keep going but log it.
            }
        }

        const { data, error } = await supabaseAdmin
            .from('tasks')
            .insert({
                project_id,
                title,
                type,
                mode,
                priority: priority ?? 2,
                reference_link: reference_link ?? null,
                drive_link,
                duration_minutes: duration_minutes ?? null,
                due_at: due_at ?? null,
            })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data, { status: 201 })
    } catch (routeError: any) {
        console.error('[Task API] Global route error:', routeError.message)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
