import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs'

type CreateModuleBody = {
  title: string
  description?: string
  isPublic?: boolean
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreateModuleBody>

    // Basic validation
    if (!body?.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // Check if module with same title already exists
    const existing = await prisma.module.findFirst({
      where: { title: body.title }
    })

    if (existing) {
      return NextResponse.json({ 
        id: existing.id, 
        title: existing.title,
        description: existing.description,
        isPublic: existing.isPublic,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
        _count: {
          questions: await prisma.question.count({
            where: { moduleId: existing.id }
          })
        }
      }, { status: 200 })
    }

    // Create module
    const created = await prisma.module.create({
      data: {
        title: body.title,
        description: body.description || null,
        isPublic: body.isPublic || false,
      },
    })

    return NextResponse.json({ 
      id: created.id, 
      title: created.title,
      description: created.description,
      isPublic: created.isPublic,
      createdAt: created.createdAt
    }, { status: 201 })
  } catch (err) {
    console.error('Create module error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || undefined
    const isPublic = searchParams.get('public') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)

    const where: any = {}
    if (q) where.title = { contains: q }
    if (isPublic) where.isPublic = true

    const [items, total] = await Promise.all([
      prisma.module.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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
        },
      }),
      prisma.module.count({ where }),
    ])

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('List modules error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}