import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

// Initialize R2 client (compatible with S3 API)
const r2Client = new S3Client({
  region: 'auto', // R2 uses 'auto' region
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = crypto.randomBytes(8).toString('hex')
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `questions/${timestamp}-${randomString}.${fileExtension}`

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // R2 doesn't use ACL, public access is controlled by bucket policy
    })

    await r2Client.send(uploadCommand)

    // Return the public URL (using custom domain or R2 public URL)
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL 
      ? `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`
      : `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    }, { status: 201 })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { 
        error: 'Upload failed',
        message: 'Failed to upload image to R2'
      },
      { status: 500 }
    )
  }
}

// Handle multiple files upload
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (files.length > 50) {
      return NextResponse.json(
        { error: 'Too many files. Maximum 50 files per request.' },
        { status: 400 }
      )
    }

    const uploadResults = []
    const errors = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
          errors.push({
            index: i,
            fileName: file.name,
            error: 'Invalid file type'
          })
          continue
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          errors.push({
            index: i,
            fileName: file.name,
            error: 'File too large'
          })
          continue
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = crypto.randomBytes(8).toString('hex')
        const fileExtension = file.name.split('.').pop() || 'jpg'
        const fileName = `questions/${timestamp}-${randomString}-${i}.${fileExtension}`

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // Upload to R2
        const uploadCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
          // R2 doesn't use ACL, public access is controlled by bucket policy
        })

        await r2Client.send(uploadCommand)

        const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL 
          ? `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`
          : `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${fileName}`

        uploadResults.push({
          index: i,
          originalFileName: file.name,
          url: publicUrl,
          fileName: fileName,
          size: file.size,
          type: file.type
        })

      } catch (error) {
        console.error(`Upload error for file ${i}:`, error)
        errors.push({
          index: i,
          fileName: file.name,
          error: 'Upload failed'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${uploadResults.length} files, ${errors.length} failed`,
      data: {
        uploaded: uploadResults,
        failed: errors
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Bulk image upload error:', error)
    return NextResponse.json(
      { 
        error: 'Upload failed',
        message: 'Failed to upload images to R2'
      },
      { status: 500 }
    )
  }
}
