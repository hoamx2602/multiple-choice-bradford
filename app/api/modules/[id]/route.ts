import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to avoid response caching issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch module without relation count to avoid MongoDB $lookup size limit
    const module = await prisma.module.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Count questions separately to avoid MongoDB aggregation size limit
    // Uses index on moduleId for fast counting
    const questionCount = await prisma.question.count({
      where: { moduleId: params.id }
    })

    return NextResponse.json({
      ...module,
      _count: {
        questions: questionCount
      }
    })
  } catch (err) {
    console.error('Get module error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}