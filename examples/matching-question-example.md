# Matching Question Example

## Cách tạo câu hỏi matching:

### 1. Format dữ liệu trong database:

**Format mới (khuyến nghị):**
```json
{
  "question": "Match the following items with their descriptions:",
  "type": "matching_question",
  "answers": {
    "premises": ["Item 1", "Item 2", "Item 3"],
    "responses": ["Match 1", "Match 2", "Match 3"]
  },
  "correctAnswers": [2, 0, 1] // Index của right items tương ứng với left items
}
```

**Format cũ (vẫn hỗ trợ):**
```json
{
  "question": "Match the following items with their descriptions:",
  "type": "matching",
  "answers": [
    "Item 1", "Item 2", "Item 3",  // Left column items
    "Match 1", "Match 2", "Match 3" // Right column items
  ],
  "correctAnswers": [2, 0, 1] // Index của right items tương ứng với left items
}
```

### 2. Logic parsing:

**Format mới:**
- **Left items**: `answers.premises`
- **Right items**: `answers.responses`
- **Correct matches**: `correctAnswers[i]` là index của right item tương ứng với left item thứ i

**Format cũ:**
- **Left items**: `answers.slice(0, Math.ceil(answers.length / 2))`
- **Right items**: `answers.slice(Math.ceil(answers.length / 2))`
- **Correct matches**: `correctAnswers[i]` là index của right item tương ứng với left item thứ i

### 3. Ví dụ cụ thể:

**Format mới:**
```json
{
  "question": "Match the following programming languages with their primary use cases:",
  "type": "matching_question",
  "answers": {
    "premises": ["JavaScript", "Python", "C++"],
    "responses": ["Web Development", "Data Science", "System Programming"]
  },
  "correctAnswers": [0, 1, 2] // JavaScript->Web, Python->Data Science, C++->System
}
```

### 4. Kết quả hiển thị:

- **Left Column**: JavaScript, Python, C++
- **Right Column**: Web Development, Data Science, System Programming
- **Correct Matches**: 
  - JavaScript ↔ Web Development
  - Python ↔ Data Science  
  - C++ ↔ System Programming

### 5. Tính năng:

- ✅ Drag & drop từ left sang right
- ✅ Drag & drop từ right sang left
- ✅ Click để clear match
- ✅ Visual feedback (hover, correct/incorrect)
- ✅ Connector lines giữa các items
- ✅ Match status display
- ✅ Responsive design