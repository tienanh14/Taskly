import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSpaceFolder } from '@/lib/google-drive'

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from('spaces')
        .select('*, projects(*)')
        .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
    const { name, color_dot } = await req.json()
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    // Create Drive folder for this space
    const drive_folder_id = await createSpaceFolder(name)

    // Try inserting with drive_folder_id
    let result = await supabaseAdmin
        .from('spaces')
        .insert({ name, color_dot: color_dot ?? '#6366f1', drive_folder_id })
        .select()
        .single()

    // Fallback if column doesn't exist
    if (result.error?.message.includes('drive_folder_id')) {
        console.warn('[Space API] Falling back: drive_folder_id column missing in DB')
        result = await supabaseAdmin
            .from('spaces')
            .insert({ name, color_dot: color_dot ?? '#6366f1' })
            .select()
            .single()
    }

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
    return NextResponse.json(result.data, { status: 201 })
}
