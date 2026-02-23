import { NextRequest, NextResponse } from 'next/server'
import { startTask, resolveTask, stopTask } from '@/lib/task-machine'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const { action } = await req.json()

    if (action === 'start') {
        const result = await startTask(id)
        if (result.error) return NextResponse.json({ error: result.error }, { status: 409 })
        return NextResponse.json({ success: true })
    }

    if (action === 'stop') {
        const result = await stopTask(id)
        if (result.error) return NextResponse.json({ error: result.error }, { status: 500 })
        return NextResponse.json({ success: true })
    }

    if (action === 'done' || action === 'expired') {
        const result = await resolveTask(id, action)
        if (result.error) return NextResponse.json({ error: result.error }, { status: 500 })
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
