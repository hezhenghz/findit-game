"use client";

import type { BoundingBox } from "@/lib/ai/doubao-vision";

interface Candidate {
  image: { url: string; localPath: string };
  bboxes: (BoundingBox & { cropImage: string })[];
}

interface CandidateReviewProps {
  candidates: Candidate[];
  items: string[];
  levelTitle: string;
  onTitleChange: (title: string) => void;
  onAccept: (candidate: Candidate) => void;
  onReject: () => void;
  onTagUpdate: (candIdx: number, bboxIdx: number, name: string) => void;
}

export function CandidateReview({
  candidates,
  items,
  levelTitle,
  onTitleChange,
  onAccept,
  onReject,
  onTagUpdate,
}: CandidateReviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={levelTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="关卡标题"
          className="px-3 py-2 border rounded-lg text-sm w-64"
        />
      </div>

      <h3 className="font-semibold text-gray-700">
        选择一张候选图（共 {candidates.length} 张）
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {candidates.map((cand, ci) => (
          <div key={ci} className="bg-white rounded-xl p-4 shadow-sm border">
            <img
              src={cand.image.localPath}
              alt={`候选 ${ci + 1}`}
              className="w-full aspect-square object-cover rounded-lg mb-3"
            />
            <p className="text-xs text-gray-400 mb-2">
              已识别 {cand.bboxes.length} 个物品
            </p>

            {/* Bbox edit */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cand.bboxes.map((bbox, bi) => (
                <div key={bi} className="text-xs border rounded p-2 flex gap-2 items-center">
                  <input
                    type="text"
                    value={bbox.name}
                    onChange={(e) => onTagUpdate(ci, bi, e.target.value)}
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <span className="text-gray-400">
                    ({bbox.bboxXMin}, {bbox.bboxYMin}) → (
                    {bbox.bboxXMax}, {bbox.bboxYMax})
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onAccept(cand)}
              className="mt-3 w-full py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              选这张
            </button>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onReject}
          className="px-6 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm"
        >
          都不满意，重新生成
        </button>
      </div>
    </div>
  );
}
