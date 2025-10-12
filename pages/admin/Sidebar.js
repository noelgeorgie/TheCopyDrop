import { LayoutDashboard, LogOut, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// This is the navigation sidebar
export default function Sidebar({ user, handleLogout }) {
  const router = useRouter();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/manage-users', label: 'User Management', icon: Users },
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-wider">SCC/ADMIN</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a className={`flex items-center p-3 rounded-lg transition-colors ${
              router.pathname === item.href 
              ? 'bg-indigo-600 text-white' 
              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}>
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-semibold">{user?.full_name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-700">
            <LogOut className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}