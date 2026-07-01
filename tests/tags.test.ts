import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatTag } from '../lib/tags.js';

describe('formatTag', () => {
  test('returns the human label for a known genre ID', () => {
    assert.equal(formatTag('indie-alternative'), 'Indie & Alternative');
    assert.equal(formatTag('hip-hop-rnb'), 'Hip-Hop & R&B');
    assert.equal(formatTag('literary-fiction'), 'Literary Fiction');
  });

  test('title-cases an unknown tag by splitting on hyphens', () => {
    assert.equal(formatTag('some-new-tag'), 'Some New Tag');
  });

  test('handles a single-word tag', () => {
    assert.equal(formatTag('anime'), 'Anime');
  });
});
