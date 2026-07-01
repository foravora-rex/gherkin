import { formatTag } from './tags';

export function buildProfileString(tags: string[], innerLife: string[], chapter: string | null): string {
  const parts: string[] = [];
  if (tags.length > 0) parts.push(`Interests: ${tags.map(formatTag).join(', ')}.`);
  if (innerLife.length > 0) parts.push(`Inner life: ${innerLife.join(', ')}.`);
  if (chapter) parts.push(`Chapter: ${chapter}.`);
  return parts.join(' ') || 'Open to anything.';
}
