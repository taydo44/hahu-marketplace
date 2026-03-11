import Link from "next/link";
import { CATEGORIES } from "@/types";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__bar" />
      <div className="page-container footer__inner">
        <div className="grid-footer">
          {/* Brand */}
          <div>
            <Link href="/" className="footer__logo">
              <div className="footer__logo-icon">
                <span style={{ color: "#fff", fontFamily: "var(--font-display)", fontSize: "1.125rem", userSelect: "none" }}>ሐ</span>
              </div>
              <span className="footer__logo-text">Hahu Marketplace</span>
            </Link>
            <p className="footer__desc">
              A community marketplace connecting the Ethiopian and East African diaspora with trusted local service providers across the United States.
            </p>
            <p className="footer__slogan">ሀበሻ — connecting our community, one service at a time.</p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="footer__heading">Platform</h4>
            <ul className="footer__links">
              {[
                { href: "/browse", label: "Browse Services" },
                { href: "/services/new", label: "Post a Service" },
                { href: "/auth/signup", label: "Create Account" },
                { href: "/dashboard", label: "Dashboard" },
              ].map(({ href, label }) => (
                <li key={href}><Link href={href} className="footer__link">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer__heading">Categories</h4>
            <ul className="footer__cat-grid">
              {CATEGORIES.slice(0, 8).map(({ value, label, emoji }) => (
                <li key={value}>
                  <Link href={`/browse?category=${value}`} className="footer__cat-link">
                    <span style={{ fontSize: "1rem" }}>{emoji}</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">© {year} Hahu Marketplace. All rights reserved.</p>
          <p className="footer__credit">Built with ❤️ for the community</p>
        </div>
      </div>
    </footer>
  );
}
