const CART_KEY = 'k-card-market-cart';
const CART_EVENT = 'cartchange';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function normalizeItem(item) {
  return {
    id: item.id,
    listingId: item.listingId ?? item.id,
    cardId: item.cardId,
    image: item.image,
    group: item.group,
    idol: item.idol,
    album: item.album,
    rarity: item.rarity,
    sellerName: item.sellerName,
    price: Number(item.price) || 0,
    condition: item.condition,
    description: item.description ?? '',
    addedAt: item.addedAt ?? new Date().toISOString(),
  };
}

function notifyCartChanged() {
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function getCart() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id).map(normalizeItem) : [];
  } catch {
    return [];
  }
}

export function saveCart(items) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CART_KEY, JSON.stringify(items.map(normalizeItem)));
  notifyCartChanged();
}

export function isInCart(listingId) {
  return getCart().some((item) => item.listingId === listingId);
}

export function addToCart(item) {
  const cart = getCart();
  const nextItem = normalizeItem(item);
  const nextCart = [nextItem, ...cart.filter((savedItem) => savedItem.listingId !== nextItem.listingId)];
  saveCart(nextCart);
  return nextCart;
}

export function removeFromCart(listingId) {
  const nextCart = getCart().filter((item) => item.listingId !== listingId);
  saveCart(nextCart);
  return nextCart;
}

export function subscribeToCart(listener) {
  const handleStorageChange = (event) => {
    if (event.key === CART_KEY) {
      listener();
    }
  };

  window.addEventListener(CART_EVENT, listener);
  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener(CART_EVENT, listener);
    window.removeEventListener('storage', handleStorageChange);
  };
}
