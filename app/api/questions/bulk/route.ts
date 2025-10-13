import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Generate content hash for duplicate detection
function generateContentHash(question: any): string {
  const content = {
    question: question.question?.trim().toLowerCase(),
    answers: Array.isArray(question.answers) 
      ? question.answers.map((a: any) => a?.toString().trim().toLowerCase()).sort()
      : question.answers,
    correctAnswers: Array.isArray(question.correctAnswers)
      ? question.correctAnswers.map((a: any) => a?.toString().trim().toLowerCase()).sort()
      : question.correctAnswers,
    type: question.type?.trim().toLowerCase(),
    moduleId: question.moduleId
  }
  
  return crypto.createHash('md5').update(JSON.stringify(content)).digest('hex')
}

// Generate unique ID
function generateUniqueId(): string {
  return crypto.randomBytes(8).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questions, moduleId } = body

    // Validation
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Questions must be an array' },
        { status: 400 }
      )
    }

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      )
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions array cannot be empty' },
        { status: 400 }
      )
    }

    if (questions.length > 100) {
      return NextResponse.json(
        { error: 'Cannot insert more than 100 questions at once' },
        { status: 400 }
      )
    }

    // Validate each question
    const validatedQuestions = []
    const errors = []

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const questionErrors = []

      if (!question.question || typeof question.question !== 'string') {
        questionErrors.push('Question text is required')
      }

      if (!question.type || typeof question.type !== 'string') {
        questionErrors.push('Question type is required')
      }

      if (!question.answers) {
        questionErrors.push('Answers are required')
      }

      if (!question.correctAnswers) {
        questionErrors.push('Correct answers are required')
      }

      if (questionErrors.length > 0) {
        errors.push({
          index: i,
          question: question.question || 'Unknown',
          errors: questionErrors
        })
        continue
      }

      // Generate hash and unique ID
      const hash = generateContentHash(question)
      const uniqueId = generateUniqueId()

      validatedQuestions.push({
        question: question.question,
        type: question.type,
        answers: question.answers,
        correctAnswers: question.correctAnswers,
        hash,
        uniqueId,
        moduleId,
        metadata: question.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // If there are validation errors, we will skip invalid items
    // and proceed with valid ones instead of failing the whole request

    // Note: Duplicate detection is now handled during individual insert

    // Insert questions one by one to handle duplicates gracefully
    const createdQuestions = []
    const failedQuestions = []

    for (const question of validatedQuestions) {
      try {
        const created = await prisma.question.create({
          data: question,
          select: {
            id: true,
            uniqueId: true,
            question: true,
            type: true,
            moduleId: true,
            createdAt: true
          }
        })
        createdQuestions.push(created)
      } catch (error: any) {
        console.error('Question creation error:', error)
        // Check if it's a duplicate error
        if (error.code === 'P2002' && error.meta?.target?.includes('hash')) {
          failedQuestions.push({
            question: question.question,
            uniqueId: question.uniqueId,
            reason: 'Duplicate question'
          })
        } else {
          failedQuestions.push({
            question: question.question,
            uniqueId: question.uniqueId,
            reason: `Database error: ${error.message || error.code || 'Unknown error'}`
          })
        }
      }
    }

    // Combine validation errors with DB errors as failed items
    const validationFailed = errors.map((e: any) => ({
      question: e.question,
      uniqueId: null,
      reason: `Validation error: ${e.errors.join(', ')}`
    }))

    const allFailed = [...validationFailed, ...failedQuestions]

    // Always return 201 (created) with partial results and failed items listed
    return NextResponse.json({
      success: true,
      message: `Created ${createdQuestions.length} question(s). ${allFailed.length} item(s) skipped.`,
      data: {
        created: createdQuestions.length,
        questions: createdQuestions
      },
      skipped: allFailed
    }, { status: 201 })

  } catch (error) {
    console.error('Bulk questions creation error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to create questions'
      },
      { status: 500 }
    )
  }
}
