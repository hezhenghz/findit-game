"use client";

import Link from "next/link";

interface LevelSummary {
  id: number;
  title: string;
  difficulty: number;
  sceneImage: string;
}

interface LevelCardProps {
  level: LevelSummary;
  unlocked: boolean;
}

export function LevelCard({ level, unlocked }: LevelCardProps) {
  if (!unlocked) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 opacity-60">
        <div className="aspect-square bg-gray-200 flex items-center justify-center">
          <span className="text-5xl">🔒</span>
        </div>
        <div className="p-2 text-center">
          <p className="text-sm text-gray-400">???</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/game/${level.id}`}
      className="block rounded-xl overflow-hidden border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-lg transition-all"
    >
      <img
        src={level.sceneImage}
        alt={level.title}
        className="aspect-square object-cover"
      />
      <div className="p-2 text-center flex items-center justify-center gap-1">
        <span className="text-sm font-medium text-gray-700">{level.title}</span>
        <span className="text-yellow-500 text-xs">
          {"★".repeat(level.difficulty)}
        </span>
      </div>
    </Link>
  );
}
