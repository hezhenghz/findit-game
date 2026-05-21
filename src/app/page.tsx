"use client";

import { useState, useEffect } from "react";
import { LevelCard } from "@/components/game/LevelCard";
import { isLevelUnlocked } from "@/lib/unlock";

interface LevelSummary {
  id: number;
  title: string;
  difficulty: number;
  sceneImage: string;
}

export default function Home() {
  const [levels, setLevels] = useState<LevelSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/levels")
      .then((res) => res.json())
      .then((data) => {
        setLevels(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">🔍 找一找</h1>
        <p className="text-gray-500 text-center mb-8">找到画面中隐藏的物品！</p>

        {levels.length === 0 ? (
          <p className="text-center text-gray-400">还没有关卡，请先去后台创建。</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {levels.map((level) => (
              <LevelCard
                key={level.id}
                level={level}
                unlocked={isLevelUnlocked(level.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
