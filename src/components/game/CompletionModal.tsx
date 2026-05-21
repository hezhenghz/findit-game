"use client";

interface CompletionModalProps {
  show: boolean;
  onBackToLevels: () => void;
}

export function CompletionModal({ show, onBackToLevels }: CompletionModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm mx-4 animate-bounce-in">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">太棒了！</h2>
        <p className="text-gray-500 mb-6">你找到了所有的东西！</p>
        <button
          onClick={onBackToLevels}
          className="px-8 py-3 bg-blue-500 text-white rounded-full text-lg font-medium hover:bg-blue-600 transition-colors"
        >
          回到关卡选择
        </button>
      </div>
    </div>
  );
}
