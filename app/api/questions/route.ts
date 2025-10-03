import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { QuestionType } from '@prisma/client'

type CreateQuestionBody = {
  type: QuestionType
  question: string
  answers: unknown
  correctAnswers: unknown
  moduleId?: string
  metadata?: Record<string, unknown>
}

function generateContentHash(payload: Omit<CreateQuestionBody, 'metadata'>): string {
  const canonical = JSON.stringify(payload)
  return crypto.createHash('md5').update(canonical).digest('hex')
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreateQuestionBody>

    // Basic validation
    if (!body?.type || !body?.question || typeof body.question !== 'string') {
      return NextResponse.json({ error: 'type and question are required' }, { status: 400 })
    }
    if (typeof body.type !== 'string') {
      return NextResponse.json({ error: 'invalid type' }, { status: 400 })
    }

    const allowedTypes = new Set([
      'multiple_choice',
      'multiple_response',
      'numerical_question',
      'ordering_question',
      'matching_question',
      'hotspot_question',
      'fallback',
      'fill_in_the_blank',
    ])
    if (!allowedTypes.has(body.type)) {
      return NextResponse.json({ error: 'unsupported question type' }, { status: 400 })
    }

    // answers and correctAnswers can be any JSON
    const answers = body.answers ?? []
    const correctAnswers = body.correctAnswers ?? null

    // Compute hash to prevent duplicates (based on type + question + answers + correctAnswers)
    const hash = generateContentHash({
      type: body.type,
      question: body.question,
      answers,
      correctAnswers,
    })

    // Ensure uniqueness by hash
    const existing = await prisma.question.findUnique({ where: { hash } })
    if (existing) {
      return NextResponse.json({ error: 'Question already exists', id: existing.id }, { status: 409 })
    }

    // Create
    const created = await prisma.question.create({
      data: {
        uniqueId: crypto.randomUUID(),
        hash,
        type: body.type as any,
        question: body.question,
        answers: answers as any,
        correctAnswers: correctAnswers as any,
        createdBy: null,
        moduleId: body.moduleId || null,
        metadata: (body.metadata ?? {}) as any,
      },
    })

    return NextResponse.json({ id: created.id, uniqueId: created.uniqueId }, { status: 201 })
  } catch (err) {
    console.error('Create question error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as
      | 'multiple_choice'
      | 'multiple_response'
      | 'numerical_question'
      | 'ordering_question'
      | 'matching_question'
      | 'hotspot_question'
      | 'fallback'
      | null
    const q = searchParams.get('q') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)

    const where: any = {}
    if (type) where.type = type
    if (q) where.question = { contains: q }

    const [items, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          uniqueId: true,
          type: true,
          question: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.question.count({ where }),
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
    console.error('List questions error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


