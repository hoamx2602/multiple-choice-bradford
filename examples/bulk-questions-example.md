# Bulk Questions API Example

## Endpoint
```
POST /api/questions/bulk
```

## Request Body
```json
{
  "moduleId": "module_id_here",
  "questions": [
    {
      "question": "What is React?",
      "type": "multiple_choice",
      "answers": ["A JavaScript library", "A database", "A server", "A programming language"],
      "correctAnswers": [0]
    },
    {
      "question": "Which of the following are React hooks?",
      "type": "multiple_response",
      "answers": ["useState", "useEffect", "document.getElementById", "useContext"],
      "correctAnswers": [0, 1, 3]
    },
    {
      "question": "What is 2 + 2?",
      "type": "numerical",
      "answers": null,
      "correctAnswers": 4
    },
    {
      "question": "Fill in the blank: React is a ___ library for building user interfaces.",
      "type": "fill_in_the_blank",
      "answers": null,
      "correctAnswers": ["JavaScript"]
    },
    {
      "question": "Match the following:",
      "type": "matching",
      "answers": {
        "premises": ["useState", "useEffect", "useContext"],
        "responses": ["State management", "Side effects", "Context sharing"]
      },
      "correctAnswers": [0, 1, 2]
    },
    {
      "question": "Arrange the following in order:",
      "type": "ordering",
      "answers": ["Component", "Render", "Mount", "Unmount"],
      "correctAnswers": [0, 1, 2, 3]
    }
  ]
}
```

## Response (Success)
```json
{
  "success": true,
  "message": "Successfully created 6 questions",
  "data": {
    "created": 6,
    "questions": [
      {
        "id": "question_id_1",
        "uniqueId": "abc123def456",
        "question": "What is React?",
        "type": "multiple_choice",
        "moduleId": "module_id_here",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      // ... more questions
    ]
  }
}
```

## Response (Validation Error)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "index": 2,
      "question": "Invalid question",
      "errors": ["Question text is required", "Answers are required"]
    }
  ],
  "message": "Found 1 invalid questions"
}
```

## Response (Partial Success with Duplicates)
```json
{
  "success": true,
  "message": "Successfully created 4 questions, 2 failed",
  "data": {
    "created": 4,
    "failed": 2,
    "questions": [
      // ... created questions
    ]
  },
  "warnings": {
    "failedQuestions": [
      {
        "question": "What is React?",
        "uniqueId": "abc123def456",
        "reason": "Duplicate question"
      },
      {
        "question": "Invalid question",
        "uniqueId": "def456ghi789",
        "reason": "Database error"
      }
    ]
  }
}
```

## Response (All Failed)
```json
{
  "error": "No questions were created",
  "failed": [
    {
      "question": "What is React?",
      "uniqueId": "abc123def456",
      "reason": "Duplicate question"
    }
  ],
  "message": "All questions failed to create"
}
```

## cURL Example
```bash
curl -X POST http://localhost:3000/api/questions/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "your_module_id",
    "questions": [
      {
        "question": "What is React?",
        "type": "multiple_choice",
        "answers": ["A JavaScript library", "A database", "A server", "A programming language"],
        "correctAnswers": [0]
      },
      {
        "question": "What is 2 + 2?",
        "type": "numerical",
        "answers": null,
        "correctAnswers": 4
      }
    ]
  }'
```

## Features
- **Bulk Insert**: Insert up to 100 questions at once
- **Validation**: Comprehensive validation for each question
- **Graceful Duplicate Handling**: Duplicates are skipped, others continue
- **Partial Success**: Some questions can succeed while others fail
- **Detailed Error Reporting**: Specific reasons for each failed question
- **Unique IDs**: Auto-generated unique IDs for each question
- **Content Hashing**: MD5 hash for duplicate detection
- **Flexible Response**: Different status codes based on results

## Response Status Codes
- **201**: All questions created successfully
- **207**: Partial success (some created, some failed)
- **400**: All questions failed (validation errors or all duplicates)
- **500**: Server error

## Limitations
- Maximum 100 questions per request
- All questions must belong to the same module
- Duplicate questions are skipped (not rejected)
- Individual question failures don't stop others
