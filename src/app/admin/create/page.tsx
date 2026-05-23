"use client";

import { useState, useCallback } from "react";
import { DifficultySelector } from "@/components/admin/DifficultySelector";
import { CandidateReview } from "@/components/admin/CandidateReview";
import type { BoundingBox } from "@/lib/ai/doubao-vision";

type Step = "input" | "generating" | "review" | "done";

interface Candidate {
  image: { url: string; localPath: string };
  bboxes: (BoundingBox & { cropImage: string })[];
}

interface GenerateResult {
  sceneDescription: string;
  items: string[];
  tags: string;
  candidates: Candidate[];
}

export default function CreateLevelPage() {
  // Input state
  const [keywords, setKeywords] = useState("");
  const [itemType, setItemType] = useState("甜品");
  const [itemCount, setItemCount] = useState(5);
  const [difficulty, setDifficulty] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sceneDescription, setSceneDescription] = useState("");
  const [items, setItems] = useState<string[]>([
    "物品1",
    "物品2",
    "物品3",
    "物品4",
    "物品5",
  ]);
  const [aiExpanding, setAiExpanding] = useState(false);

  // Generation state
  const [step, setStep] = useState<Step>("input");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  // Selected level info
  const [levelTitle, setLevelTitle] = useState("");

  const handleAiExpand = async () => {
    if (!keywords.trim()) return;
    setAiExpanding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, itemType, itemCount }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setSceneDescription(data.sceneDescription);
      // Pad/slice items to match itemCount
      const padded = [...data.items];
      while (padded.length < itemCount) padded.push(`物品${padded.length + 1}`);
      setItems(padded.slice(0, itemCount));
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI 扩充失败");
    } finally {
      setAiExpanding(false);
    }
  };

  const handleGenerate = async () => {
    if (!sceneDescription.trim()) return;
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords,
          itemType,
          itemCount,
          difficulty,
          sceneDescription,
          items,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { taskId } = await res.json();
      setTaskId(taskId);

      // Poll for completion
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const pollRes = await fetch(`/api/admin/tasks/${taskId}`);
        if (!pollRes.ok) continue;
        const pollData = await pollRes.json();
        setProgress(pollData.progress);

        if (pollData.status === "completed") {
          setResult(pollData.result);
          setLevelTitle(
            pollData.result?.sceneDescription?.slice(0, 20) || "新关卡"
          );
          setStep("review");
          return;
        }
        if (pollData.status === "failed") {
          throw new Error(pollData.error || "生成失败");
        }
      }
      throw new Error("生成超时");
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败");
      setStep("input");
    }
  };

  const handleAcceptCandidate = async (candidate: Candidate) => {
    try {
      const bboxes = candidate.bboxes.map((b, i) => ({
        name: b.name,
        cropImage: b.cropImage,
        bboxXMin: b.bboxXMin,
        bboxYMin: b.bboxYMin,
        bboxXMax: b.bboxXMax,
        bboxYMax: b.bboxYMax,
        sortOrder: i + 1,
      }));

      const res = await fetch("/api/admin/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: levelTitle || "新关卡",
          keywords,
          tags: result?.tags || "",
          sceneDescription,
          difficulty,
          sceneImage: candidate.image.localPath,
          targetItems: bboxes,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">增加关卡</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline"
          >
            关闭
          </button>
        </div>
      )}

      {step === "generating" && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎨</div>
          <p className="text-gray-600 text-lg">{progress || "准备中..."}</p>
          <p className="text-gray-400 text-sm mt-2">
            生成场景图需要 1-2 分钟，请耐心等待
          </p>
        </div>
      )}

      {step === "review" && result && (
        <CandidateReview
          candidates={result.candidates}
          items={result.items}
          levelTitle={levelTitle}
          onTitleChange={setLevelTitle}
          onAccept={handleAcceptCandidate}
          onReject={() => {
            setStep("input");
            alert("已返回，可重新调整参数后生成");
          }}
          onTagUpdate={async (candIdx, bboxIdx, name) => {
            if (!result) return;
            const newCandidates = [...result.candidates];
            newCandidates[candIdx].bboxes[bboxIdx].name = name;
            setResult({ ...result, candidates: newCandidates });
          }}
        />
      )}

      {step === "done" && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-gray-700 text-lg">关卡已保存到关卡库！</p>
          <button
            onClick={() => {
              setStep("input");
              setResult(null);
              setTaskId(null);
            }}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            继续创建
          </button>
        </div>
      )}

      {step === "input" && (
        <div className="space-y-6">
          {/* Keywords + AI expand */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-3">场景设定</h3>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="输入关键词，如：女孩、甜品"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="text"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                placeholder="物品类型"
                className="w-24 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <select
                value={itemCount}
                onChange={(e) => {
                  const n = parseInt(e.target.value);
                  setItemCount(n);
                  setItems((prev) => {
                    const p = [...prev];
                    while (p.length < n) p.push(`物品${p.length + 1}`);
                    return p.slice(0, n);
                  });
                }}
                className="w-20 px-2 py-2 border rounded-lg text-sm"
              >
                {[3, 4, 5, 6, 7].map((n) => (
                  <option key={n} value={n}>
                    {n}个
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAiExpand}
              disabled={aiExpanding || !keywords.trim()}
              className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              {aiExpanding ? "AI 生成中..." : "AI 补充"}
            </button>
          </div>

          {/* Scene description + items */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-3">场景描述</h3>
            <textarea
              value={sceneDescription}
              onChange={(e) => setSceneDescription(e.target.value)}
              placeholder="AI 补充生成的详细场景描述，也可手动填写..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-3">
              目标物品（{itemCount}个）
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {items.map((item, i) => (
                <input
                  key={i}
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = e.target.value;
                    setItems(next);
                  }}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder={`物品${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <DifficultySelector
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            showAdvanced={showAdvanced}
            onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
          />

          {/* Generate button */}
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={!sceneDescription.trim()}
              className="px-8 py-3 bg-blue-500 text-white text-lg rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-lg"
            >
              生成 4 张候选图
            </button>
            <p className="text-gray-400 text-xs mt-2">
              AI 将生成场景底图并自动标注物品位置
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
