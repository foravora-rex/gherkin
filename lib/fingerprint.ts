import { createHash } from 'crypto';

export function buildFingerprint(rows: { rendered_text: string }[]): string {
  const content = rows.map((r) => r.rendered_text).join('\x00');
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}
