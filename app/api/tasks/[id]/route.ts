import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { deleteFile, extractFileId, renameFile } from '@/lib/google-drive'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { title, priority, reference_link, duration_minutes, due_at } = body
        console.log(`[Task PATCH] ID: ${id}, Body:`, body)

        // 1. Get old task data to check for title change
        const { data: oldTask, error: getError } = await supabaseAdmin
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single()

        if (getError || !oldTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // 2. If title changed and there's a drive_link, rename the file on Google Drive
        if (title && title !== oldTask.title && oldTask.drive_link) {
            const fileId = extractFileId(oldTask.drive_link)
            if (fileId) {
                try {
                    // If it's a Drive link, we rename it. 
                    // Note: If it's a Markdown fallback, we might want to append .md, 
                    // but Drive API handles 'name' generally. 
                    const newFileName = oldTask.type === 'CONTENT' && oldTask.drive_link.includes('document')
                        ? title
                        : (oldTask.drive_link.endsWith('.md') ? `${title}.md` : title)

                    await renameFile(fileId, newFileName)
                } catch (driveError: any) {
                    console.error('[Task API] Failed to rename Drive file:', driveError.message)
                }
            }
        }

        // 3. Update task in Supabase
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .update({
                title: title ?? oldTask.title,
                priority: priority ?? oldTask.priority,
                reference_link: reference_link !== undefined ? reference_link : oldTask.reference_link,
                duration_minutes: duration_minutes !== undefined ? duration_minutes : oldTask.duration_minutes,
                due_at: due_at !== undefined ? due_at : oldTask.due_at,
            })
            .eq('id', id)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data)

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // 1. Get task to find drive file
        const { data: task, error: getError } = await supabaseAdmin
            .from('tasks')
            .select('drive_link')
            .eq('id', id)
            .single()

        if (getError || !task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // 2. Delete from Google Drive if exists
        if (task.drive_link) {
            const fileId = extractFileId(task.drive_link)
            if (fileId) {
                await deleteFile(fileId)
            }
        }

        // 3. Delete from Supabase
        const { error: deleteError } = await supabaseAdmin
            .from('tasks')
            .delete()
            .eq('id', id)

        if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
