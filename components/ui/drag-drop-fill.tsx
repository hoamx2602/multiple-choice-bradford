"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface DragDropFillProps {
  question: string
  answers: string[]
  correctAnswers: string[]
  onAnswerChange: (answers: string[]) => void
  currentAnswer?: string[]
}

export function DragDropFill({ 
  question, 
  answers, 
  correctAnswers, 
  onAnswerChange, 
  currentAnswer = [] 
}: DragDropFillProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  // Parse question to find blanks (marked with $1, $2, etc.)
  const parseQuestion = (text: string) => {
    const regex = /\$(\d+)/g
    const result: Array<{ type: 'text' | 'blank', content: string, index?: number }> = []
    let lastIndex = 0
    let match
    let blankCount = 0

    while ((match = regex.exec(text)) !== null) {
      // Add text before the blank
      if (match.index > lastIndex) {
        const textContent = text.slice(lastIndex, match.index)
        if (textContent.trim()) {
          result.push({ type: 'text', content: textContent })
        }
      }
      
      // Add the blank
      const blankIndex = parseInt(match[1]) - 1
      result.push({ type: 'blank', content: match[0], index: blankIndex })
      blankCount++
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const textContent = text.slice(lastIndex)
      if (textContent.trim()) {
        result.push({ type: 'text', content: textContent })
      }
    }
    
    return result
  }

  const questionParts = parseQuestion(question)
  const blankCount = questionParts.filter(part => part.type === 'blank').length

  // Initialize currentAnswer with empty strings if not provided
  const userAnswers = currentAnswer.length === blankCount ? currentAnswer : Array(blankCount).fill('')

  // Debug logging
  console.log('Question:', question)
  console.log('Question parts:', questionParts)
  console.log('Blank count:', blankCount)
  console.log('User answers:', userAnswers)

  const handleDragStart = (e: React.DragEvent, word: string) => {
    setDraggedItem(word)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setHoveredSlot(null)
  }

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setHoveredSlot(slotIndex)
  }

  const handleDragLeave = () => {
    setHoveredSlot(null)
  }

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault()
    if (draggedItem) {
      const newAnswers = [...userAnswers]
      // Only fill the specific slot that was dropped on
      newAnswers[slotIndex] = draggedItem
      console.log('Dropping word:', draggedItem, 'into slot:', slotIndex, 'newAnswers:', newAnswers)
      onAnswerChange(newAnswers)
    }
    setDraggedItem(null)
    setHoveredSlot(null)
  }

  const handleWordClick = (word: string) => {
    // Find next empty slot
    const emptySlotIndex = userAnswers.findIndex(answer => answer === '')
    if (emptySlotIndex !== -1) {
      const newAnswers = [...userAnswers]
      newAnswers[emptySlotIndex] = word
      onAnswerChange(newAnswers)
    }
  }

  const clearSlot = (slotIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[slotIndex] = ''
    onAnswerChange(newAnswers)
  }

  const getAvailableWords = () => {
    // Count how many times each word is used
    const wordCount: { [key: string]: number } = {}
    userAnswers.forEach(answer => {
      if (answer !== '') {
        wordCount[answer] = (wordCount[answer] || 0) + 1
      }
    })
    
    // Return words that haven't been used up
    return answers.filter(word => {
      const usedCount = wordCount[word] || 0
      const totalCount = answers.filter(w => w === word).length
      return usedCount < totalCount
    })
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-sm text-muted-foreground">
        Drag and drop the words to their places. Or for the relevant word to go to the next available slot, click on the tile at the bottom, it's a lot faster.
      </div>

      {/* Question with blanks */}
      <div className="text-base leading-relaxed">
        {questionParts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={`text-${index}`}>{part.content}</span>
          } else {
            const slotIndex = part.index!
            const answer = userAnswers[slotIndex] || ''
            console.log('Rendering blank:', slotIndex, 'answer:', answer, 'part:', part)
            return (
              <span
                key={`blank-${slotIndex}-${index}`}
                className={cn(
                  "inline-block mx-1 px-2 py-1 min-w-[80px] min-h-[32px] border-2 border-dashed border-gray-300 rounded text-center cursor-pointer transition-colors",
                  hoveredSlot === slotIndex && "border-blue-400 bg-blue-50",
                  answer && "border-solid border-gray-400 bg-gray-50",
                  !answer && "text-gray-400"
                )}
                onDragOver={(e) => {
                  console.log('Drag over slot:', slotIndex)
                  handleDragOver(e, slotIndex)
                }}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  console.log('Drop on slot:', slotIndex)
                  handleDrop(e, slotIndex)
                }}
                onClick={() => answer && clearSlot(slotIndex)}
              >
                {answer || `[blank ${slotIndex + 1}]`}
              </span>
            )
          }
        })}
      </div>

      {/* Word Bank */}
      <div className="space-y-3">
        <div className="text-sm font-medium">Word Bank:</div>
        <div className="flex flex-wrap gap-2">
          {getAvailableWords().map((word, index) => (
            <div
              key={`${word}-${index}`}
              className={cn(
                "px-3 py-2 bg-gray-100 border border-gray-300 rounded cursor-pointer transition-colors hover:bg-gray-200 select-none",
                draggedItem === word && "opacity-50"
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, word)}
              onDragEnd={handleDragEnd}
              onClick={() => handleWordClick(word)}
            >
              {word}
            </div>
          ))}
        </div>
      </div>

      {/* Used Words Display */}
      {userAnswers.some(answer => answer !== '') && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Your answers:</div>
          <div className="flex flex-wrap gap-2">
            {userAnswers.map((answer, index) => (
              <div
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                {index + 1}: {answer || 'empty'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}