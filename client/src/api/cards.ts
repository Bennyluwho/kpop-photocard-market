import type { CardFeedItem, CardSummary, GroupSummary } from "./types";

const API_BASE = "/api";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ??
        `Request failed with status ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchCardFeed(search?: string): Promise<CardFeedItem[]> {
  const params = new URLSearchParams();
  if (search?.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();
  const url = `${API_BASE}/cards/feed${query ? `?${query}` : ""}`;
  return parseJson<CardFeedItem[]>(await fetch(url));
}

export async function fetchGroups(): Promise<GroupSummary[]> {
  return parseJson<GroupSummary[]>(await fetch(`${API_BASE}/cards/groups`));
}

export async function fetchCardSummary(cardId: string): Promise<CardSummary> {
  return parseJson<CardSummary>(await fetch(`${API_BASE}/cards/${cardId}/summary`));
}
