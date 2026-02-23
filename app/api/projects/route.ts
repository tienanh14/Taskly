import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createProjectStructure, getOrCreateRootFolder } from '@/lib/google-drive'

export async function POST(req: NextRequest) {
    const { space_id, name } = await req.json()
    if (!space_id || !name) {
        return NextResponse.json({ error: 'space_id and name are required' }, { status: 400 })
    }

    // 1. Get the space's drive folder ID
    // We select ALL to avoid error if drive_folder_id is missing, or we handle the error
    const { data: space, error: spaceError } = await supabaseAdmin
        .from('spaces')
        .select('*')
        .eq('id', space_id)
        .single()

    // Fallback to Root if space folder ID is missing or column doesn't exist
    const spaceFolderId = space?.['drive_folder_id' as keyof typeof space] || await getOrCreateRootFolder()

    // 2. Create hierarchical project structure
    const { folderId, docsFolderId, mediaFolderId } = await createProjectStructure(name, spaceFolderId)

    // 3. Store combined folder IDs as "root|docs|media"
    const drive_folder_id = `${folderId}|${docsFolderId}|${mediaFolderId}`

    // 4. Try inserting with drive_folder_id
    let result = await supabaseAdmin
        .from('projects')
        .insert({ space_id, name, drive_folder_id })
        .select()
        .single()

    // Fallback if column doesn't exist in projects table
    if (result.error?.message.includes('drive_folder_id')) {
        console.warn('[Project API] Falling back: drive_folder_id column missing in DB')
        result = await supabaseAdmin
            .from('projects')
            .insert({ space_id, name })
            .select()
            .single()
    }

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
    return NextResponse.json(result.data, { status: 201 })
}
