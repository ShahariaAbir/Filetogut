import { Outlet, NavLink, useNavigate } from 'react-router';
import { insforge } from '../lib/insforge';
import { FolderOpen, Key, BookOpen, Database, LogOut, UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await insforge.auth.signOut();
    } catch(e) {
      // Ignored for dev bypass mode
    }
    // Fire a custom event to clear session in App.tsx memory
    window.dispatchEvent(new CustomEvent('dev-logout'));
    navigate('/login');
  };

  const navItems = [
    { label: 'Files', path: '/files', icon: FolderOpen },
    { label: 'Keys', path: '/api-keys', icon: Key },
    { label: 'Docs', path: '/docs', icon: BookOpen },
    { label: 'Setup', path: '/setup', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans pb-20">
      
      {/* Mobile Header */}
      <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">ForgeCloud</span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 text-slate-500 hover:text-red-600 transition-colors bg-slate-50 rounded-full"
          aria-label="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 z-20 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
          {navItems.map((item) => (
             <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full rounded-lg text-[10px] font-medium transition-colors",
                isActive 
                  ? "text-indigo-600" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-6 h-6", location.pathname === item.path ? "fill-indigo-50/50" : "")} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

    </div>
  );
}
