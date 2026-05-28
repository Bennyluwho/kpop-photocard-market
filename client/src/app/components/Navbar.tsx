import { User, Heart, Menu } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center">
              <a href="/" className="font-semibold text-xl">
                K-Card Market
              </a>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="/#marketplace" className="text-sm hover:text-primary transition-colors">Browse</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Sell</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">About</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" aria-label="Favorites" className="p-2 hover:bg-accent rounded-lg transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button type="button" aria-label="Account" className="p-2 hover:bg-accent rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Open navigation menu"
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
