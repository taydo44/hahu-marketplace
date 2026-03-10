import Link from "next/link";
import { CATEGORIES } from "@/types";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-axum-950 text-axum-300 mt-auto">
      <div className="h-1 bg-gradient-to-r from-teff-600 via-teff-400 to-walia-500" />

      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
              <div className="w-9 h-9 rounded-xl bg-teff-gradient flex items-center justify-center">
                <span className="text-white font-display text-lg select-none">ሐ</span>
              </div>
              <span className="font-display text-xl text-white">Hahu Marketplace</span>
            </Link>
            <p className="text-sm leading-relaxed text-axum-400 max-w-xs">
              A community marketplace connecting the Ethiopian and East African diaspora with trusted local service providers across the United States.
            </p>
            <p className="text-axum-500 text-xs mt-5 italic">
              ሀበሻ — connecting our community, one service at a time.
            </p>
          </div>

          {/* Platform */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/browse", label: "Browse Services" },
                { href: "/services/new", label: "Post a Service" },
                { href: "/auth/signup", label: "Create Account" },
                { href: "/dashboard", label: "Dashboard" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-axum-400 hover:text-teff-300 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-3 md:col-start-9">
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2.5 text-sm grid grid-cols-2 gap-x-4">
              {CATEGORIES.slice(0, 8).map(({ value, label, emoji }) => (
                <li key={value}>
                  <Link href={`/browse?category=${value}`}
                    className="text-axum-400 hover:text-teff-300 transition-colors flex items-center gap-1.5">
                    <span className="text-base">{emoji}</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-axum-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-axum-500">© {year} Hahu Marketplace. All rights reserved.</p>
          <p className="text-xs text-axum-600">Built with ❤️ for the community</p>
        </div>
      </div>
    </footer>
  );
}
