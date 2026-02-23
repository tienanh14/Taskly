import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
    // 1. Scan for 'processing' tasks that have passed their due_at (end_time)
    const { data: overdueTasks, error: fetchError } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('status', 'processing')
        .lt('due_at', new Date().toISOString())
        .not('due_at', 'is', null)

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!overdueTasks || overdueTasks.length === 0) {
        return NextResponse.json({ tasks: [] }, { status: 200 })
    }

    // 2. Update their status to 'expired' using the service role
    const taskIds = overdueTasks.map(t => t.id)
    const { error: updateError } = await supabaseAdmin
        .from('tasks')
        .update({ status: 'expired' })
        .in('id', taskIds)

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Include the updated status for the client notification
    const updatedTasks = overdueTasks.map(t => ({ ...t, status: 'expired' }))

    // 3. Return the newly expired tasks to notify the client-side
    return NextResponse.json({ tasks: updatedTasks }, { status: 200 })
}
