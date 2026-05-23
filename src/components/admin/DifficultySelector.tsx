"use client";

interface DifficultySelectorProps {
  difficulty: number;
  onDifficultyChange: (d: number) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

const LABELS: Record<number, string> = {
  1: "很简单",
  2: "简单",
  3: "中等",
  4: "困难",
  5: "很难",
};

export function DifficultySelector({
  difficulty,
  onDifficultyChange,
  showAdvanced,
  onToggleAdvanced,
}: DifficultySelectorProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="font-semibold text-gray-700 mb-3">
        难度：{difficulty} 星 — {LABELS[difficulty]}
      </h3>
      <input
        type="range"
        min={1}
        max={5}
        value={difficulty}
        onChange={(e) => onDifficultyChange(parseInt(e.target.value))}
        className="w-full accent-yellow-500"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>★</span>
        <span>★★★</span>
        <span>★★★★★</span>
      </div>

      <button
        onClick={onToggleAdvanced}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
      >
        {showAdvanced ? "收起高级设置 ▲" : "展开高级设置 ▼"}
      </button>

      {showAdvanced && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
          <p>
            目标物品在画面中的占比、干扰物数量、画面总物品数等参数由系统根据难度星级自动从预设值读取。在"难度预设管理"页面可修改各星级的具体参数。
          </p>
        </div>
      )}
    </div>
  );
}
