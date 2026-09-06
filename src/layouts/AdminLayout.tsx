import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, ShoppingCart, Package, Tags, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminLayout() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="inline-block" target="_blank">
            <span className="font-display font-bold text-2xl tracking-tighter text-white">
              Flex<span className="text-lime-400">R</span> <span className="text-neutral-500 text-sm font-normal ml-1">Admin</span>
            </span>
          </Link>
          <button 
            className="lg:hidden text-neutral-400 hover:text-white"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-lime-500/10 text-lime-400" 
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800 shrink-0">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-display font-bold text-xl text-white">
              Flex<span className="text-lime-400">R</span>
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 text-neutral-50 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
