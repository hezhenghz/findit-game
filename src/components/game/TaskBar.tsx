"use client";

import type { TargetItem } from "@/lib/engine/types";

interface TaskBarProps {
  items: TargetItem[];
  foundIndices: number[];
}

export function TaskBar({ items, foundIndices }: TaskBarProps) {
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex justify-center gap-4 py-4">
      {sorted.map((item, i) => {
        const originalIndex = items.findIndex((t) => t.sortOrder === item.sortOrder);
        const found = foundIndices.includes(originalIndex);
        return (
          <div
            key={item.sortOrder}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
              found
                ? "border-green-400 bg-green-50 opacity-40 scale-95"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="relative">
              <img
                src={item.cropImage}
                alt={item.name}
                className="w-16 h-16 object-contain rounded"
              />
              {found && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-green-500 text-4xl font-bold">✓</div>
                </div>
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                found ? "text-green-500 line-through" : "text-gray-700"
              }`}
            >
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
