const TAG_LABELS: Record<string, string> = {
  'indie-alternative': 'Indie & Alternative',
  'folk-singer-songwriter': 'Folk & Singer-Songwriter',
  'classical-jazz': 'Classical & Jazz',
  'electronic-dance': 'Electronic & Dance',
  'hip-hop-rnb': 'Hip-Hop & R&B',
  'world-music': 'World Music',
  'metal-rock': 'Metal & Rock',
  'blues-soul-country': 'Blues, Soul & Country',
};

export function formatTag(tag: string): string {
  if (TAG_LABELS[tag]) return TAG_LABELS[tag];
  return tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
