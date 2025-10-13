# Client-Side Upload Flow for Bulk Questions

## Complete Flow
1. **Collect data** (100 questions with images)
2. **Upload images to S3** first
3. **Get S3 URLs** from upload response
4. **Map URLs to questions**
5. **Send bulk API** with S3 URLs instead of base64

## JavaScript Implementation

```javascript
// 1. Upload images to S3 first
async function uploadQuestionImages(questions) {
  const imageFiles = []
  const imageMap = new Map() // questionIndex -> file
  
  // Extract image files from questions
  questions.forEach((question, index) => {
    if (question.imageFile) {
      imageFiles.push(question.imageFile)
      imageMap.set(index, question.imageFile)
    }
  })
  
  if (imageFiles.length === 0) {
    return questions // No images to upload
  }
  
  // Upload all images to S3
  const formData = new FormData()
  imageFiles.forEach(file => {
    formData.append('files', file)
  })
  
  const uploadResponse = await fetch('/api/upload/image', {
    method: 'PUT',
    body: formData
  })
  
  const uploadResult = await uploadResponse.json()
  
  if (!uploadResult.success) {
    throw new Error('Image upload failed')
  }
  
  // Map S3 URLs back to questions
  const questionsWithUrls = questions.map((question, index) => {
    if (question.imageFile) {
      const uploadedFile = uploadResult.data.uploaded.find(
        (file, i) => imageMap.get(index) === imageFiles[i]
      )
      
      return {
        ...question,
        imageUrl: uploadedFile?.url || null,
        imageFile: undefined // Remove file object
      }
    }
    return question
  })
  
  return questionsWithUrls
}

// 2. Send bulk questions with S3 URLs
async function bulkImportQuestions(moduleId, questions) {
  try {
    // First upload images
    const questionsWithUrls = await uploadQuestionImages(questions)
    
    // Then send to bulk API
    const response = await fetch('/api/questions/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        moduleId,
        questions: questionsWithUrls
      })
    })
    
    const result = await response.json()
    return result
    
  } catch (error) {
    console.error('Bulk import failed:', error)
    throw error
  }
}

// 3. Usage example
async function handleBulkImport() {
  const moduleId = 'your_module_id'
  const questions = [
    {
      question: 'What is React?',
      type: 'multiple_choice',
      answers: ['A library', 'A framework', 'A language', 'A tool'],
      correctAnswers: [0],
      imageFile: imageFile1 // File object from input
    },
    {
      question: 'What is 2 + 2?',
      type: 'numerical',
      answers: null,
      correctAnswers: 4,
      imageFile: imageFile2 // File object from input
    }
    // ... 98 more questions
  ]
  
  try {
    const result = await bulkImportQuestions(moduleId, questions)
    console.log('Import result:', result)
    
    if (result.success) {
      console.log(`Created ${result.data.created} questions`)
      if (result.skipped?.length > 0) {
        console.log(`Skipped ${result.skipped.length} questions:`, result.skipped)
      }
    }
  } catch (error) {
    console.error('Import failed:', error)
  }
}
```

## React Component Example

```jsx
import { useState } from 'react'

function BulkQuestionImporter() {
  const [questions, setQuestions] = useState([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    // Process files and create questions array
    // Each question should have imageFile property
  }
  
  const handleImport = async () => {
    setUploading(true)
    try {
      const result = await bulkImportQuestions(moduleId, questions)
      setResult(result)
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div>
      <input 
        type="file" 
        multiple 
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <button 
        onClick={handleImport}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Import Questions'}
      </button>
      
      {result && (
        <div>
          <p>Created: {result.data.created} questions</p>
          {result.skipped?.length > 0 && (
            <div>
              <p>Skipped: {result.skipped.length} questions</p>
              <ul>
                {result.skipped.map((item, index) => (
                  <li key={index}>
                    {item.question}: {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

## Benefits of This Approach

### **Performance Benefits:**
- **Smaller payloads** - URLs instead of base64 images
- **Faster uploads** - Parallel image uploads
- **Better caching** - S3 serves images efficiently
- **Reduced memory** - No base64 in localStorage

### **Storage Benefits:**
- **No localStorage limit** - Images stored in R2
- **Scalable** - Handle thousands of questions
- **CDN ready** - Images served via Cloudflare CDN
- **Cost effective** - R2 is cheaper than database storage
- **No egress fees** - No data transfer costs

### **User Experience:**
- **Progress tracking** - Show upload progress
- **Error handling** - Specific error messages
- **Retry capability** - Failed uploads can be retried
- **Preview** - Show uploaded images before import

## Error Handling

```javascript
async function robustBulkImport(moduleId, questions) {
  const maxRetries = 3
  let retryCount = 0
  
  while (retryCount < maxRetries) {
    try {
      return await bulkImportQuestions(moduleId, questions)
    } catch (error) {
      retryCount++
      if (retryCount >= maxRetries) {
        throw new Error(`Import failed after ${maxRetries} attempts: ${error.message}`)
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
    }
  }
}
```

## Environment Setup

```env
# Add to .env.local
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com  # Optional
```

This approach solves the localStorage and payload size issues while providing a much better user experience!
