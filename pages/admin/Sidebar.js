import { ChevronDown, LayoutDashboard, LogOut, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

// This is the navigation sidebar
export default function Sidebar({ user, handleLogout }) {
  const router = useRouter();

  // 3. Update the navItems data structure
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      label: 'User Management',
      icon: Users,
      basePath: '/admin/manage-users', // Used to detect active parent
      subItems: [
        { href: '/admin/manage-users/all', label: 'All Users' },
        { href: '/admin/manage-users/add', label: 'Add New User' },
        { href: '/admin/manage-users/roles', label: 'Manage Roles' },
      ],
    },
  ];

  // 4. State to manage which dropdown is open.
  // We'll initialize it based on the current route for a better user experience.
  const activeParent = navItems.find(item => item.basePath && router.pathname.startsWith(item.basePath));
  const [openDropdown, setOpenDropdown] = useState(activeParent ? activeParent.label : null);


  const handleDropdownToggle = (label) => {
    // If the clicked dropdown is already open, close it. Otherwise, open it.
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-wider">SCC - ADMIN</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {/* 5. Updated rendering logic */}
        {navItems.map((item) => (
          item.subItems ? (
            <div key={item.label}>
              <button
                onClick={() => handleDropdownToggle(item.label)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  router.pathname.startsWith(item.basePath)
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
              </button>
              {/* Conditionally render sub-items */}
              {openDropdown === item.label && (
                <div className="pl-6 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link key={subItem.href} href={subItem.href} legacyBehavior>
                      <a className={`flex items-center p-2 rounded-lg text-sm transition-colors ${
                        router.pathname === subItem.href
                        ? 'text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}>
                        {subItem.label}
                      </a>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
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
          )
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