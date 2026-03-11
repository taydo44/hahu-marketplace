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
    <header className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="page-container">
        <div className="navbar__inner">
          {/* Logo */}
          <Link href="/" className="navbar__logo">
            <div className="navbar__logo-icon">
              <span style={{ color: "#fff", fontFamily: "var(--font-display)", fontSize: "1rem", lineHeight: 1, userSelect: "none" }}>ሐ</span>
            </div>
            <span className="navbar__logo-text">
              Hahu<span className="navbar__logo-accent"> Marketplace</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="navbar__nav">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`navbar__link${isActive(link.href) ? " navbar__link--active" : ""}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="navbar__actions">
            <Link href="/browse" className="btn btn-ghost btn-sm" style={{ color: "var(--axum-600)" }}>
              <Search size={15} /> <span className="hide-mobile">Search</span>
            </Link>
            {user ? (
              <>
                <Link href="/services/new" className="btn btn-primary btn-sm">
                  <Plus size={15} /> Post Service
                </Link>
                <div className="navbar__user-menu-wrap" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="navbar__avatar-btn">
                    <div className="navbar__avatar">
                      {user.email?.[0].toUpperCase() ?? "U"}
                    </div>
                    <span className={`navbar__chevron${userMenuOpen ? " navbar__chevron--open" : ""}`}>
                      <ChevronDown size={13} />
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="navbar__user-menu">
                      <div className="navbar__user-email">{user.email}</div>
                      <hr className="divider" />
                      {[
                        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                        { href: "/profile", icon: UserIcon, label: "Profile" },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href} className="navbar__menu-link"
                          onClick={() => setUserMenuOpen(false)}>
                          <span className="navbar__menu-icon"><Icon size={14} /></span>
                          {label}
                        </Link>
                      ))}
                      <hr className="divider" />
                      <button onClick={handleSignOut} className="navbar__menu-signout">
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
          <button className="navbar__mobile-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="navbar__mobile">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`navbar__mobile-link${isActive(link.href) ? " navbar__mobile-link--active" : ""}`}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/services/new" className="navbar__mobile-link navbar__mobile-link--cta">+ Post a Service</Link>
                <Link href="/dashboard" className="navbar__mobile-link">Dashboard</Link>
                <Link href="/profile" className="navbar__mobile-link">Profile</Link>
                <button onClick={handleSignOut} className="navbar__mobile-signout">Sign Out</button>
              </>
            ) : (
              <div className="navbar__mobile-auth">
                <Link href="/auth/login" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>Sign In</Link>
                <Link href="/auth/signup" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>Join Free</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
