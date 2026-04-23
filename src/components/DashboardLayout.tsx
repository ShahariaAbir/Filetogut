import { Outlet, NavLink, useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { FolderOpen, Key, BookOpen, Database, LogOut, UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch(e) {
      // Ignored for dev bypass mode
    }
    // Fire a custom event to clear session in App.tsx memory
    window.dispatchEvent(new CustomEvent('dev-logout'));
    navigate('/login');
  };

  const navItems = [
    { label: 'My Files', path: '/files', icon: FolderOpen },
    { label: 'API Keys', path: '/api-keys', icon: Key },
    { label: 'API Docs', path: '/docs', icon: BookOpen },
    { label: 'Database Setup', path: '/setup', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight uppercase">ForgeCloud</span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
             <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 bg-white text-slate-500 hover:bg-red-50 hover:text-red-700 w-full rounded-md text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
               <UploadCloud className="w-5 h-5 text-white" />
             </div>
             <span className="font-bold text-lg tracking-tight uppercase">ForgeCloud</span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
