import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const module = await prisma.module.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            questions: true
          }
        }
      }
    })

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    return NextResponse.json(module)
  } catch (err) {
    console.error('Get module error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}