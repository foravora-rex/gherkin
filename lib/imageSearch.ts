import redis from './redis';

export type ImageResult = {
  url: string;
  label: string;
  source: 'tmdb' | 'spotify' | 'anilist' | 'unsplash';
  creditName?: string;
  creditUrl?: string;
};

const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

async function searchTmdb(query: string): Promise<ImageResult[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&api_key=${process.env.TMDB_API_KEY}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? [])
    .filter((r: Record<string, unknown>) => r.profile_path || r.poster_path)
    .slice(0, 8)
    .map((r: Record<string, unknown>) => ({
      url: `${TMDB_IMG_BASE}${r.profile_path ?? r.poster_path}`,
      label: (r.name ?? r.title ?? '') as string,
      source: 'tmdb' as const,
    }));
}

const SPOTIFY_TOKEN_KEY = 'gherkin:spotify_token';

async function getSpotifyToken(): Promise<string | null> {
  const cached = await redis.get<string>(SPOTIFY_TOKEN_KEY);
  if (cached) return cached;

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) return null;

  const data = await res.json();
  const token = data.access_token as string;
  await redis.set(SPOTIFY_TOKEN_KEY, token, { ex: 3000 }); // 50 min TTL
  return token;
}

async function searchSpotify(query: string): Promise<ImageResult[]> {
  const token = await getSpotifyToken();
  if (!token) return [];
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=8`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.artists?.items ?? [])
    .filter((a: Record<string, unknown>) => Array.isArray(a.images) && (a.images as unknown[]).length > 0)
    .map((a: Record<string, unknown>) => ({
      url: (a.images as Array<{ url: string }>)[0].url,
      label: a.name as string,
      source: 'spotify' as const,
    }));
}

async function searchAniList(query: string): Promise<ImageResult[]> {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query ($search: String) {
          chars: Page(perPage: 5) {
            characters(search: $search) {
              name { full }
              image { large }
            }
          }
          shows: Page(perPage: 5) {
            media(search: $search, type: ANIME) {
              title { english romaji }
              coverImage { large }
            }
          }
        }
      `,
      variables: { search: query },
    }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  const characters: ImageResult[] = (data.data?.chars?.characters ?? [])
    .filter((c: Record<string, unknown>) => (c.image as Record<string, string>)?.large)
    .map((c: Record<string, unknown>) => ({
      url: (c.image as Record<string, string>).large,
      label: (c.name as Record<string, string>).full,
      source: 'anilist' as const,
    }));
  const shows: ImageResult[] = (data.data?.shows?.media ?? [])
    .filter((m: Record<string, unknown>) => (m.coverImage as Record<string, string>)?.large)
    .map((m: Record<string, unknown>) => ({
      url: (m.coverImage as Record<string, string>).large,
      label: ((m.title as Record<string, string>).english ?? (m.title as Record<string, string>).romaji ?? ''),
      source: 'anilist' as const,
    }));
  return [...characters, ...shows];
}

async function searchUnsplash(query: string): Promise<ImageResult[]> {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=squarish`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((r: Record<string, unknown>) => ({
    url: (r.urls as Record<string, string>).regular,
    label: (r.alt_description ?? r.description ?? 'Photo') as string,
    source: 'unsplash' as const,
    creditName: (r.user as Record<string, string>).name,
    creditUrl: `https://unsplash.com/@${(r.user as Record<string, string>).username}?utm_source=gherkin&utm_medium=referral`,
  }));
}

export async function searchImages(query: string): Promise<ImageResult[]> {
  const [tmdb, spotify, anilist, unsplash] = await Promise.allSettled([
    searchTmdb(query),
    searchSpotify(query),
    searchAniList(query),
    searchUnsplash(query),
  ]);
  return [
    ...(tmdb.status === 'fulfilled' ? tmdb.value : []),
    ...(spotify.status === 'fulfilled' ? spotify.value : []),
    ...(anilist.status === 'fulfilled' ? anilist.value : []),
    ...(unsplash.status === 'fulfilled' ? unsplash.value : []),
  ];
}
