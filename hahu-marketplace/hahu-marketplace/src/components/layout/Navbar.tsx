"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Menu, X, ChevronDown, LayoutDashboard, User as UserIcon, LogOut, Plus, Search } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
  ];

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-md border-b border-injera-100 shadow-sm" : "bg-white border-b border-injera-100"
    }`}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-teff-gradient flex items-center justify-center shadow-sm">
              <span className="text-white font-display text-base leading-none select-none">ሐ</span>
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="font-display text-lg text-axum-950 tracking-tight">Hahu</span>
              <span className="font-display text-lg text-teff-600 tracking-tight"> Marketplace</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href) ? "bg-teff-50 text-teff-700" : "text-axum-600 hover:text-axum-900 hover:bg-axum-50"
                }`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/browse" className="btn btn-ghost btn-sm text-axum-600">
              <Search size={15} /> Search
            </Link>
            {user ? (
              <>
                <Link href="/services/new" className="btn btn-primary btn-sm">
                  <Plus size={15} /> Post Service
                </Link>
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-injera-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-teff-100 flex items-center justify-center text-teff-700 text-xs font-bold">
                      {user.email?.[0].toUpperCase() ?? "U"}
                    </div>
                    <ChevronDown size={13} className={`text-axum-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 card py-1.5 z-50 animate-fade-in">
                      <div className="px-3 py-2 mb-1">
                        <p className="text-xs text-axum-400 truncate">{user.email}</p>
                      </div>
                      <div className="divider mb-1" />
                      {[
                        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                        { href: "/profile", icon: UserIcon, label: "Profile" },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-axum-700 hover:bg-injera-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}>
                          <Icon size={14} className="text-axum-400" />
                          {label}
                        </Link>
                      ))}
                      <div className="divider my-1" />
                      <button onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-harar-600 hover:bg-harar-50 transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link href="/auth/signup" className="btn btn-primary btn-sm">Join Free</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-injera-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-injera-100 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(link.href) ? "bg-teff-50 text-teff-700" : "text-axum-700 hover:bg-injera-50"
                }`}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/services/new" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-teff-700 hover:bg-teff-50">+ Post a Service</Link>
                <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-axum-700 hover:bg-injera-50">Dashboard</Link>
                <Link href="/profile" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-axum-700 hover:bg-injera-50">Profile</Link>
                <button onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-harar-600 hover:bg-harar-50">
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2 px-1">
                <Link href="/auth/login" className="btn btn-secondary flex-1 text-center btn-sm">Sign In</Link>
                <Link href="/auth/signup" className="btn btn-primary flex-1 text-center btn-sm">Join Free</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
