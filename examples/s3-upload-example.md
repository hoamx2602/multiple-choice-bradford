# Cloudflare R2 Image Upload API Examples

## Environment Variables Required
```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com  # Optional: Custom domain
```

## Single Image Upload
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "file=@/path/to/image.jpg"
```

### Response
```json
{
  "success": true,
  "url": "https://pub-your-account-id.r2.dev/questions/1704067200000-abc123def456.jpg",
  "fileName": "questions/1704067200000-abc123def456.jpg",
  "size": 245760,
  "type": "image/jpeg"
}
```

## Multiple Images Upload
```bash
curl -X PUT http://localhost:3000/api/upload/image \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.png" \
  -F "files=@/path/to/image3.gif"
```

### Response
```json
{
  "success": true,
  "message": "Uploaded 3 files, 0 failed",
  "data": {
    "uploaded": [
      {
        "index": 0,
        "fileName": "image1.jpg",
        "url": "https://pub-your-account-id.r2.dev/questions/1704067200000-abc123def456-0.jpg",
        "fileName": "questions/1704067200000-abc123def456-0.jpg",
        "size": 245760,
        "type": "image/jpeg"
      },
      {
        "index": 1,
        "fileName": "image2.png",
        "url": "https://pub-your-account-id.r2.dev/questions/1704067200000-abc123def456-1.png",
        "fileName": "questions/1704067200000-abc123def456-1.png",
        "size": 189440,
        "type": "image/png"
      }
    ],
    "failed": []
  }
}
```

## JavaScript Client Example
```javascript
// Single file upload
async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData
  })
  
  return await response.json()
}

// Multiple files upload
async function uploadImages(files) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  
  const response = await fetch('/api/upload/image', {
    method: 'PUT',
    body: formData
  })
  
  return await response.json()
}

// Usage example
const fileInput = document.getElementById('imageInput')
const files = Array.from(fileInput.files)

// Upload all images first
const uploadResult = await uploadImages(files)

// Then use URLs in bulk questions API
const questionsWithImages = questions.map((question, index) => ({
  ...question,
  imageUrl: uploadResult.data.uploaded[index]?.url || null
}))

// Send to bulk API
const bulkResponse = await fetch('/api/questions/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    moduleId: 'your_module_id',
    questions: questionsWithImages
  })
})
```

## Features
- **Single & Bulk Upload**: Support both single file and multiple files
- **File Validation**: Type and size validation
- **Unique Naming**: Timestamp + random string to prevent conflicts
- **Public URLs**: Images are publicly accessible
- **Error Handling**: Detailed error reporting for failed uploads
- **Size Limit**: 5MB per file, max 50 files per bulk request

## File Organization
- **Path Structure**: `questions/{timestamp}-{random}-{index}.{ext}`
- **Public Access**: All images are publicly readable via R2 public URL
- **CDN Ready**: URLs can be used with Cloudflare CDN or custom domains
- **Custom Domain**: Set `CLOUDFLARE_R2_PUBLIC_URL` for custom domain

## Error Responses
```json
{
  "error": "No file provided",
  "status": 400
}
```

```json
{
  "error": "Invalid file type. Only images are allowed.",
  "status": 400
}
```

```json
{
  "error": "File too large. Maximum size is 5MB.",
  "status": 400
}
```

## Integration with Bulk Questions
1. **Upload images first** using this API to R2
2. **Get URLs** from upload response
3. **Map URLs** to questions
4. **Send bulk request** with image URLs instead of base64 data
5. **Much smaller payload** and faster processing

## Cloudflare R2 Benefits
- **S3 Compatible**: Uses same AWS SDK
- **Global CDN**: Built-in Cloudflare CDN
- **Cost Effective**: Cheaper than AWS S3
- **Fast**: Global edge locations
- **Custom Domains**: Support for custom domains
- **No Egress Fees**: No data transfer costs
