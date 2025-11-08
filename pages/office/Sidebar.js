import { LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function OfficeSidebar({ user, handleLogout }) {
  const router = useRouter();

  const navItems = [
    { href: '/office/dashboard', label: 'Print Job Queue', icon: LayoutDashboard },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-800 text-white">
      {/* User Info */}
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold">{user?.full_name || 'Front Office'}</h2>
        <p className="text-sm text-gray-400">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} legacyBehavior>
            <a className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
              router.pathname === item.href
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}