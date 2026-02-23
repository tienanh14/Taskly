import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { uploadFile, parseFolderIds } from '@/lib/google-drive'
import { Readable } from 'stream'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const taskId = formData.get('taskId') as string

        if (!file || !taskId) {
            return NextResponse.json({ error: 'Missing file or taskId' }, { status: 400 })
        }

        // 1. Get task and project folder info
        const { data: task, error: taskError } = await supabaseAdmin
            .from('tasks')
            .select('*, projects(drive_folder_id)')
            .eq('id', taskId)
            .single()

        if (taskError || !task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        const driveFolderId = (task as any).projects?.drive_folder_id
        const { mediaFolderId } = parseFolderIds(driveFolderId)

        if (!mediaFolderId) {
            return NextResponse.json({ error: 'Media folder not found for this project' }, { status: 400 })
        }

        // 2. Convert File to Readable Stream for Google Drive API
        const buffer = Buffer.from(await file.arrayBuffer())
        const stream = new Readable()
        stream.push(buffer)
        stream.push(null)

        // 3. Upload to Google Drive
        console.log(`[Upload API] Uploading ${file.name} to Drive...`)
        const driveLink = await uploadFile(
            mediaFolderId,
            file.name,
            file.type,
            stream
        )

        // 4. Update task in Supabase
        const { error: updateError } = await supabaseAdmin
            .from('tasks')
            .update({ drive_link: driveLink })
            .eq('id', taskId)

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, link: driveLink })

    } catch (error: any) {
        console.error('[Upload API] Error:', error.message)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
