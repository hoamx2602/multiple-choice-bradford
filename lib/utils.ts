import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Thay thế các placeholder $1, $2, $3... trong câu hỏi fill-in-the-blank bằng đáp án từ mảng correctAnswers
 * @param questionText - Văn bản câu hỏi chứa các placeholder $1, $2, $3...
 * @param correctAnswers - Mảng chứa các đáp án đúng theo thứ tự
 * @returns Văn bản câu hỏi với đáp án đã được thay thế
 */
export function fillInTheBlankAnswers(questionText: string, correctAnswers: string[]): string {
  if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
    return questionText
  }

  let result = questionText
  
  // Thay thế từng placeholder $1, $2, $3... bằng đáp án tương ứng
  correctAnswers.forEach((answer, index) => {
    const placeholder = `$${index + 1}`
    result = result.replace(new RegExp(`\\${placeholder}`, 'g'), answer)
  })
  
  return result
}

/**
 * Thay thế các placeholder $1, $2, $3... trong câu hỏi fill-in-the-blank bằng đáp án từ mảng correctAnswers với styling màu xanh
 * @param questionText - Văn bản câu hỏi chứa các placeholder $1, $2, $3...
 * @param correctAnswers - Mảng chứa các đáp án đúng theo thứ tự
 * @returns JSX element với đáp án được highlight màu xanh
 */
export function fillInTheBlankAnswersWithHighlight(questionText: string, correctAnswers: string[]): React.ReactNode {
  if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
    return questionText
  }

  const regex = /\$(\d+)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(questionText)) !== null) {
    // Thêm phần văn bản trước placeholder
    if (match.index > lastIndex) {
      parts.push(questionText.slice(lastIndex, match.index))
    }
    
    // Thêm đáp án với styling màu xanh
    const answerIndex = parseInt(match[1]) - 1
    if (answerIndex < correctAnswers.length) {
      parts.push(
        React.createElement('span', {
          key: `answer-${answerIndex}`,
          className: 'text-green-600 font-medium'
        }, correctAnswers[answerIndex])
      )
    }
    
    lastIndex = match.index + match[0].length
  }
  
  // Thêm phần văn bản còn lại
  if (lastIndex < questionText.length) {
    parts.push(questionText.slice(lastIndex))
  }
  
  return React.createElement(React.Fragment, null, ...parts)
}