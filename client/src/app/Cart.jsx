import { useEffect, useMemo, useState } from 'react';
import { Lock, ShoppingCart, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';
import { ImageWithFallback } from './components/ImageWithFallback';
import { Navbar } from './components/Navbar';
import { PrimaryLink } from './components/PrimaryButton';
import { SecondaryButton, SecondaryLink } from './components/SecondaryButton';
import { SectionHeader } from './components/SectionHeader';
import { EmptyState } from './components/StatusStates';
import { getCart, removeFromCart, saveCart, subscribeToCart } from './cartStore.js';

export default function Cart() {
  const [cart, setCart] = useState(() => getCart());

  useEffect(() => {
    const refreshCart = () => setCart(getCart());
    return subscribeToCart(refreshCart);
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price, 0),
    [cart]
  );

  function handleRemove(listingId) {
    setCart(removeFromCart(listingId));
  }

  function handleClearAll() {
    saveCart([]);
    setCart([]);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-semibold leading-tight md:text-4xl">
            <ShoppingCart className="h-8 w-8 md:h-9 md:w-9" />
            Cart
          </h1>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            Review selected listings before checkout.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Listings</p>
            <p className="mt-2 text-2xl font-semibold">{cart.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:col-span-2">
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(subtotal)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <SectionHeader
              title="Selected Listings"
              action={
                cart.length > 0 && (
                  <SecondaryButton type="button" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4" />
                    Clear cart
                  </SecondaryButton>
                )
              }
            />

            {cart.length === 0 ? (
              <EmptyState
                title="Your cart is empty"
                message="Add an available listing from a card detail page."
                action={<PrimaryLink href="/#marketplace">Browse photocards</PrimaryLink>}
              />
            ) : (
              <div className="grid gap-4">
                {cart.map((item) => (
                  <CartItem key={item.listingId} item={item} onRemove={handleRemove} />
                ))}
              </div>
            )}
          </section>

          <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <SummaryRow label="Items" value={String(cart.length)} />
              <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
              <SummaryRow label="Shipping" value="Later" />
              <SummaryRow label="Taxes" value="Later" />
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <SummaryRow label="MVP total" value={formatCurrency(subtotal)} strong />
            </div>
            <button
              type="button"
              disabled
              className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-60 shadow-sm"
            >
              <Lock className="h-4 w-4" />
              Checkout coming soon
            </button>
            <SecondaryLink href="/#marketplace" className="mt-3 w-full">
              Keep Shopping
            </SecondaryLink>
          </aside>
        </div>
      </main>
    </div>
  );
}

function CartItem({ item, onRemove }) {
  return (
    <article className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[110px_1fr_auto]">
      <a href={`/cards/${item.cardId}`} className="overflow-hidden rounded-lg border border-border bg-muted">
        <ImageWithFallback
          src={item.image}
          alt={`${item.idol} - ${item.album}`}
          className="aspect-[3/4] h-full w-full object-cover"
        />
      </a>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{item.group}</p>
        <a href={`/cards/${item.cardId}`} className="font-semibold hover:text-primary">
          {item.idol}
        </a>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.album}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-accent px-2 py-1">{item.condition}</span>
          <span className="rounded bg-accent px-2 py-1">Seller: {item.sellerName}</span>
        </div>
        {item.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 sm:flex-col sm:items-end">
        <p className="text-xl font-semibold">{formatCurrency(item.price)}</p>
        <SecondaryButton type="button" onClick={() => onRemove(item.listingId)}>
          <Trash2 className="h-4 w-4" />
          Remove
        </SecondaryButton>
      </div>
    </article>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
      <span className={strong ? 'font-semibold' : ''}>{value}</span>
    </div>
  );
}
