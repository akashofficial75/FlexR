import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import CartDrawer from '../components/CartDrawer';
import { cn } from '../lib/utils';

export function RootLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const cartItemsCount = useCartStore(state => state.items.reduce((total, item) => total + item.quantity, 0));
  const setIsCartOpen = useCartStore(state => state.setIsOpen);
  const fetchSettings = useSettingsStore(state => state.fetchSettings);
  const settings = useSettingsStore(state => state.settings);
  const location = useLocation();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <header 
        className={cn(
          "fixed top-0 w-full z-40 transition-all duration-300 border-b border-transparent",
          isScrolled ? "bg-neutral-950/80 backdrop-blur-md border-neutral-800 py-3" : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 z-50">
              <span className="font-display font-bold text-2xl tracking-tighter text-white">
                Flex<span className="text-lime-400">R</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-lime-400",
                    location.pathname === link.path ? "text-white" : "text-neutral-400"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4 z-50">
              <Link to="/shop" className="text-neutral-400 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-neutral-400 hover:text-white transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-lime-500 text-neutral-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              <button 
                className="md:hidden text-neutral-400 hover:text-white transition-colors ml-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-neutral-950/95 backdrop-blur-md z-30 md:hidden transition-all duration-300 flex flex-col pt-24 px-6",
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        <nav className="flex flex-col gap-6 text-2xl font-display font-medium">
          {navLinks.map(link => (
            <Link 
              key={link.name} 
              to={link.path}
              className={cn(
                "transition-colors",
                location.pathname === link.path ? "text-lime-400" : "text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      <CartDrawer />

      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>

      <footer className="bg-neutral-900 border-t border-neutral-800 pt-16 pb-8 z-10 relative mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4 md:col-span-1">
              <Link to="/" className="inline-block">
                <span className="font-display font-bold text-2xl tracking-tighter text-white">
                  Flex<span className="text-lime-400">R</span>
                </span>
              </Link>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                {settings?.footer_description || "Premium gym essentials designed for movement, comfort and everyday performance."}
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Shop</h3>
              <ul className="space-y-3">
                <li><Link to="/shop" className="text-neutral-400 hover:text-white transition-colors text-sm">All Products</Link></li>
                <li><Link to="/category/sweatpants" className="text-neutral-400 hover:text-white transition-colors text-sm">Sweatpants</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Support</h3>
              <ul className="space-y-3">
                <li><span className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer">Delivery Info</span></li>
                <li><span className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer">Returns & Exchanges</span></li>
                <li><span className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer">Contact Us</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Connect</h3>
              <ul className="space-y-3">
                {settings?.instagram_url && (
                  <li><a href={settings.instagram_url} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition-colors text-sm">Instagram</a></li>
                )}
                {settings?.facebook_url && (
                  <li><a href={settings.facebook_url} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition-colors text-sm">Facebook</a></li>
                )}
                {settings?.whatsapp_number && (
                  <li><a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition-colors text-sm">WhatsApp</a></li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-sm">
              &copy; {new Date().getFullYear()} FlexR. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="cursor-pointer hover:text-neutral-300 transition-colors">Privacy</span>
              <span className="cursor-pointer hover:text-neutral-300 transition-colors">Terms</span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-neutral-500 text-sm">
              <strong>Developed By AkashProg</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
