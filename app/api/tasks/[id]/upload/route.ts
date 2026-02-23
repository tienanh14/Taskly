import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { uploadFile, parseFolderIds } from '@/lib/google-drive'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    // Fetch task + project for folder info
    const { data: task } = await supabaseAdmin
        .from('tasks')
        .select('*, projects(drive_folder_id)')
        .eq('id', id)
        .single()

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    if (task.type !== 'MEDIA') return NextResponse.json({ error: 'Not a MEDIA task' }, { status: 400 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const { mediaFolderId } = parseFolderIds(task.projects?.drive_folder_id ?? null)

    const arrayBuffer = await file.arrayBuffer()
    const { Readable } = await import('stream')
    const stream = Readable.from(Buffer.from(arrayBuffer))

    const driveLink = await uploadFile(
        mediaFolderId ?? 'root',
        file.name,
        file.type,
        stream
    )

    // Update task with Drive link
    const { data, error } = await supabaseAdmin
        .from('tasks')
        .update({ drive_link: driveLink })
        .eq('id', id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}
