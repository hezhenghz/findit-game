"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { GameCanvas } from "@/components/game/GameCanvas";
import { TaskBar } from "@/components/game/TaskBar";
import { CompletionModal } from "@/components/game/CompletionModal";
import { createInitialState, findItem, isCompleted } from "@/lib/engine/game-state";
import { unlockNextLevel } from "@/lib/unlock";
import type { LevelData, GameState } from "@/lib/engine/types";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [level, setLevel] = useState<LevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialState());

  useEffect(() => {
    fetch(`/api/levels/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "关卡不存在" : "加载失败");
        return res.json();
      })
      .then((data) => {
        setLevel(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleItemFound = useCallback(
    (index: number) => {
      setGameState((prev) => {
        if (!level) return prev;
        return findItem(prev, index, level.targetItems.length);
      });
    },
    [level]
  );

  // Unlock next level when game is completed
  const completed = isCompleted(gameState);
  const didUnlock = useRef(false);
  useEffect(() => {
    if (completed && !didUnlock.current) {
      didUnlock.current = true;
      unlockNextLevel(level!.id);
    }
  }, [completed, level]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">加载中...</p>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">{error || "关卡加载失败"}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-[800px] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 返回
        </button>
        <h1 className="text-lg font-bold text-gray-700">{level.title}</h1>
        <span className="text-sm text-gray-400">
          已找到 {gameState.foundItemIndices.length}/{level.targetItems.length}
        </span>
      </div>

      {/* Game canvas */}
      <GameCanvas
        sceneImage={level.sceneImage}
        targetItems={level.targetItems}
        foundIndices={gameState.foundItemIndices}
        onItemFound={handleItemFound}
      />

      {/* Task bar */}
      <div className="w-full max-w-[800px]">
        <TaskBar items={level.targetItems} foundIndices={gameState.foundItemIndices} />
      </div>

      {/* Completion modal */}
      <CompletionModal
        show={isCompleted(gameState)}
        onBackToLevels={() => router.push("/")}
      />
    </div>
  );
}
