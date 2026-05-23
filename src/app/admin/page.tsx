import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="max-w-lg mx-auto mt-20 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">关卡管理</h2>
      <div className="flex gap-4 justify-center">
        <Link
          href="/admin/create"
          className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          增加关卡
        </Link>
        <Link
          href="/admin/levels"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
        >
          关卡库
        </Link>
      </div>
    </div>
  );
}
