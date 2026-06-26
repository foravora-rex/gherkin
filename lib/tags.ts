export type Genre = { id: string; label: string };

export type GenreCategory = {
  label: string;
  genres: Genre[];
};

export const GENRE_TAXONOMY: Record<string, GenreCategory> = {
  music: {
    label: 'Music',
    genres: [
      { id: 'indie-alternative', label: 'Indie & Alternative' },
      { id: 'pop', label: 'Pop' },
      { id: 'folk-singer-songwriter', label: 'Folk & Singer-Songwriter' },
      { id: 'classical-jazz', label: 'Classical & Jazz' },
      { id: 'electronic-dance', label: 'Electronic & Dance' },
      { id: 'hip-hop-rnb', label: 'Hip-Hop & R&B' },
      { id: 'world-music', label: 'World Music' },
      { id: 'metal-rock', label: 'Metal & Rock' },
      { id: 'blues-soul-country', label: 'Blues, Soul & Country' },
    ],
  },
  'screen-stage': {
    label: 'Films & Series',
    genres: [
      { id: 'cinema', label: 'Cinema' },
      { id: 'comfort-tv', label: 'Comfort TV' },
      { id: 'anime', label: 'Anime' },
    ],
  },
  'stories-words': {
    label: 'Books & Writing',
    genres: [
      { id: 'literary-fiction', label: 'Literary Fiction' },
      { id: 'fantasy-sci-fi', label: 'Fantasy & Sci-Fi' },
      { id: 'fanfiction', label: 'Fanfiction' },
    ],
  },
};

// All known genre IDs across all categories
export const ALL_GENRE_IDS = new Set(
  Object.values(GENRE_TAXONOMY).flatMap((c) => c.genres.map((g) => g.id))
);

// Broad interest tag values (from onboarding Q1)
export const BROAD_TAGS = ['music', 'screen-stage', 'stories-words', 'gaming', 'theatre', 'podcasts', 'art', 'sport'];

const TAG_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(GENRE_TAXONOMY).flatMap((c) => c.genres.map((g) => [g.id, g.label]))
);

export function formatTag(tag: string): string {
  if (TAG_LABELS[tag]) return TAG_LABELS[tag];
  return tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
