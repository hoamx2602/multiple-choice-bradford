import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
    
    // Generate test URLs
    const testFileName = 'test-debug.txt'
    const r2DevUrl = `https://pub-${accountId}.r2.dev/${testFileName}`
    const customUrl = publicUrl ? `${publicUrl}/${testFileName}` : null
    
    return NextResponse.json({
      success: true,
      debug: {
        accountId,
        bucketName,
        publicUrl,
        generatedUrls: {
          r2Dev: r2DevUrl,
          custom: customUrl
        },
        instructions: {
          step1: 'Check if R2 bucket has public access enabled',
          step2: 'Verify bucket policy allows public read',
          step3: 'Test the generated URLs in browser',
          step4: 'If using custom domain, ensure DNS is configured'
        }
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
