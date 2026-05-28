import { useState } from 'react';
import { Heart, Menu, User, X } from 'lucide-react';

const navLinks = [
  { href: '/#marketplace', label: 'Browse' },
  { href: '/sell', label: 'Sell' },
  { href: '#', label: 'About' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center">
              <a href="/" className="font-semibold text-xl">
                K-Card Market
              </a>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href="/watchlist" aria-label="Watchlist" className="rounded-lg p-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Heart className="w-5 h-5" />
            </a>
            <button type="button" aria-label="Profile" className="rounded-lg p-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <User className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
              className="rounded-lg p-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border py-3 md:hidden">
            <div className="grid gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
