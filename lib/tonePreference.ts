export const TONE_PROMOTION_THRESHOLD = 3;

export function shouldPromoteTone(toneCount: number): boolean {
  return toneCount >= TONE_PROMOTION_THRESHOLD;
}
