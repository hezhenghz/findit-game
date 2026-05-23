import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-3 flex items-center gap-6">
        <Link href="/admin" className="font-bold text-blue-600">
          管理后台
        </Link>
        <Link href="/admin/create" className="text-sm text-gray-600 hover:text-gray-900">
          增加关卡
        </Link>
        <Link href="/admin/levels" className="text-sm text-gray-600 hover:text-gray-900">
          关卡库
        </Link>
        <div className="flex-1" />
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← 回到游戏
        </Link>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
