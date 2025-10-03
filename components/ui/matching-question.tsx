"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface MatchingItem {
  id: string
  text: string
  matchId?: string
}

interface MatchingQuestionProps {
  question: string
  leftItems: MatchingItem[]
  rightItems: MatchingItem[]
  correctMatches: { [leftId: string]: string } // leftId -> rightId
  onAnswerChange: (matches: { [leftId: string]: string }) => void
  currentAnswer?: { [leftId: string]: string }
}

export function MatchingQuestion({ 
  question, 
  leftItems, 
  rightItems, 
  correctMatches, 
  onAnswerChange, 
  currentAnswer = {} 
}: MatchingQuestionProps) {
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'left' | 'right' } | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [matches, setMatches] = useState<{ [leftId: string]: string }>(currentAnswer)
  const [connectionLines, setConnectionLines] = useState<Array<{ from: string, to: string, color: string }>>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Update connection lines when matches change
  useEffect(() => {
    const updateLines = () => {
      const lines: Array<{ from: string, to: string, color: string }> = []
      
      Object.entries(matches).forEach(([leftId, rightId]) => {
        const isCorrect = isCorrectMatch(leftId, rightId)
        lines.push({
          from: leftId,
          to: rightId,
          color: isCorrect ? '#10b981' : '#ef4444' // green for correct, red for incorrect
        })
      })
      
      setConnectionLines(lines)
    }

    // Update immediately
    updateLines()
    
    // Also update after a short delay to ensure DOM elements are rendered
    const timeout = setTimeout(updateLines, 100)
    
    return () => clearTimeout(timeout)
  }, [matches, correctMatches])

  const handleDragStart = (e: React.DragEvent, itemId: string, type: 'left' | 'right') => {
    setDraggedItem({ id: itemId, type })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setHoveredItem(null)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setHoveredItem(targetId)
  }

  const handleDragLeave = () => {
    setHoveredItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string, targetType: 'left' | 'right') => {
    e.preventDefault()
    
    if (!draggedItem) return

    const newMatches = { ...matches }

    if (draggedItem.type === 'left' && targetType === 'right') {
      // Left item dropped on right item
      newMatches[draggedItem.id] = targetId
    } else if (draggedItem.type === 'right' && targetType === 'left') {
      // Right item dropped on left item
      newMatches[targetId] = draggedItem.id
    }

    setMatches(newMatches)
    onAnswerChange(newMatches)
    setDraggedItem(null)
    setHoveredItem(null)
    
    // Force re-render of connection lines after a short delay
    setTimeout(() => {
      const lines: Array<{ from: string, to: string, color: string }> = []
      
      Object.entries(newMatches).forEach(([leftId, rightId]) => {
        const isCorrect = isCorrectMatch(leftId, rightId)
        lines.push({
          from: leftId,
          to: rightId,
          color: isCorrect ? '#10b981' : '#ef4444'
        })
      })
      
      setConnectionLines(lines)
    }, 50)
  }

  const clearMatch = (leftId: string) => {
    const newMatches = { ...matches }
    delete newMatches[leftId]
    setMatches(newMatches)
    onAnswerChange(newMatches)
  }

  const getMatchedRightItem = (leftId: string) => {
    const rightId = matches[leftId]
    return rightItems.find(item => item.id === rightId)
  }

  const getMatchedLeftItem = (rightId: string) => {
    const leftId = Object.keys(matches).find(key => matches[key] === rightId)
    return leftItems.find(item => item.id === leftId)
  }

  const isCorrectMatch = (leftId: string, rightId: string) => {
    return correctMatches[leftId] === rightId
  }

  const getMatchStatus = (leftId: string) => {
    const rightId = matches[leftId]
    if (!rightId) return 'unmatched'
    return isCorrectMatch(leftId, rightId) ? 'correct' : 'incorrect'
  }

  // Function to get element position
  const getElementPosition = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (!element || !containerRef.current) return null
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    
    return {
      x: elementRect.left - containerRect.left + elementRect.width / 2,
      y: elementRect.top - containerRect.top + elementRect.height / 2
    }
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-base font-medium">
        {question}
      </div>

      {/* Matching Area */}
      <div ref={containerRef} className="relative flex gap-8 justify-center">
        {/* SVG for connection lines */}
        <svg 
          className="absolute inset-0 pointer-events-none z-10" 
          style={{ width: '100%', height: '100%' }}
        >
          {connectionLines.map((line, index) => {
            const fromPos = getElementPosition(line.from)
            const toPos = getElementPosition(line.to)
            
            if (!fromPos || !toPos) return null
            
            return (
              <g key={index}>
                {/* Shadow/glow effect */}
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={line.color}
                  strokeWidth="4"
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                />
                {/* Main line */}
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={line.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                {/* Animated dots along the line */}
                <circle
                  cx={fromPos.x + (toPos.x - fromPos.x) * 0.3}
                  cy={fromPos.y + (toPos.y - fromPos.y) * 0.3}
                  r="2"
                  fill={line.color}
                  className="animate-pulse"
                />
                <circle
                  cx={fromPos.x + (toPos.x - fromPos.x) * 0.7}
                  cy={fromPos.y + (toPos.y - fromPos.y) * 0.7}
                  r="2"
                  fill={line.color}
                  className="animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
              </g>
            )
          })}
        </svg>
        {/* Left Column - Items to be matched */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-center text-gray-600">Items</div>
          {leftItems.map((item, index) => {
            const matchedRight = getMatchedRightItem(item.id)
            const status = getMatchStatus(item.id)
            
            return (
              <div
                id={item.id}
                key={item.id}
                className={cn(
                  "relative px-4 py-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all duration-200 min-w-[120px] text-center",
                  hoveredItem === item.id && "border-blue-400 bg-blue-50",
                  status === 'correct' && "border-green-400 bg-green-50",
                  status === 'incorrect' && "border-red-400 bg-red-50",
                  matchedRight && "border-solid"
                )}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.id, 'left')}
                onClick={() => matchedRight && clearMatch(item.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.text}</span>
                  {matchedRight && (
                    <button
                      className="ml-2 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearMatch(item.id)
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                
                {/* Connector */}
                <div className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded-full"></div>
              </div>
            )
          })}
        </div>

        {/* Right Column - Descriptions/Matches */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-center text-gray-600">Matches</div>
          {rightItems.map((item, index) => {
            const matchedLeft = getMatchedLeftItem(item.id)
            const isDragged = draggedItem?.id === item.id
            
            return (
              <div
                id={item.id}
                key={item.id}
                className={cn(
                  "relative px-4 py-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all duration-200 min-w-[120px] text-center",
                  hoveredItem === item.id && "border-blue-400 bg-blue-50",
                  isDragged && "opacity-50",
                  matchedLeft && "border-solid"
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id, 'right')}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.id, 'right')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.text}</span>
                  {/* Drag handle */}
                  <div className="ml-2 flex flex-col gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
                
                {/* Connector */}
                <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded-full"></div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Match Status */}
      {Object.keys(matches).length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Current Matches:</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(matches).map(([leftId, rightId]) => {
              const leftItem = leftItems.find(item => item.id === leftId)
              const rightItem = rightItems.find(item => item.id === rightId)
              const isCorrect = isCorrectMatch(leftId, rightId)
              
              return (
                <div
                  key={`${leftId}-${rightId}`}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs",
                    isCorrect 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {leftItem?.text} ↔ {rightItem?.text}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}