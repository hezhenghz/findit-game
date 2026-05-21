import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">🔍 找一找</h1>
      <p className="text-gray-500 mb-8">找到画面中隐藏的物品！</p>
      <Link
        href="/game/1"
        className="px-8 py-4 bg-blue-500 text-white rounded-full text-lg font-medium hover:bg-blue-600 transition-colors shadow-lg"
      >
        开始游戏
      </Link>
    </div>
  );
}
