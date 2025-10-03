"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface OrderQuestionProps {
  question: string
  items: string[]
  correctOrder: number[] // Array of indices showing correct order
  onOrderChange: (orderedItems: string[]) => void
  currentOrder?: string[]
}

export function OrderQuestion({
  question,
  items,
  correctOrder,
  onOrderChange,
  currentOrder = [],
}: OrderQuestionProps) {
  const [orderedItems, setOrderedItems] = useState<string[]>(
    currentOrder.length === items.length ? currentOrder : items
  )
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null)
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItemIndex === null || draggedItemIndex === index) return
    setHoveredItemIndex(index)
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragLeave = () => {
    setHoveredItemIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
      setDraggedItemIndex(null)
      setHoveredItemIndex(null)
      return
    }

    const newOrderedItems = [...orderedItems]
    const [draggedItem] = newOrderedItems.splice(draggedItemIndex, 1)
    newOrderedItems.splice(dropIndex, 0, draggedItem)

    setOrderedItems(newOrderedItems)
    onOrderChange(newOrderedItems)
    setDraggedItemIndex(null)
    setHoveredItemIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItemIndex(null)
    setHoveredItemIndex(null)
  }

  const resetOrder = () => {
    setOrderedItems(items)
    onOrderChange(items)
  }


  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-base font-medium">{question}</div>

      {/* Ordering Area */}
      <div className="flex justify-center">
        {/* Draggable Items */}
        <div className="w-80">
          <div className="text-sm font-medium text-center text-gray-600 mb-4">Sắp xếp của bạn</div>
          <div className="space-y-3">
            {orderedItems.map((item, index) => (
              <div key={`draggable-${item}-${index}`} className="flex items-center gap-3 h-12">
                {/* Number outside */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-blue-500">
                  {index + 1}
                </div>
                {/* Content */}
                <div
                  className={cn(
                    "flex-1 px-3 py-2 border-2 rounded-lg bg-white shadow-sm transition-all duration-200 h-12 flex items-center",
                    "cursor-grab active:cursor-grabbing",
                    draggedItemIndex === index && "opacity-50 border-blue-400 shadow-lg",
                    hoveredItemIndex === index && "border-blue-500 bg-blue-50 scale-[1.02]",
                    hoveredItemIndex !== null && draggedItemIndex !== null && hoveredItemIndex === index && draggedItemIndex !== index && "scale-[1.05] shadow-md"
                  )}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-gray-800">{item}</span>
                    <span className="text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="9" cy="5" r="1" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="15" cy="5" r="1" />
                        <circle cx="15" cy="19" r="1" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-end">
        <button
          onClick={resetOrder}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}