import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { buildProfileString } from '../lib/profile.js';

describe('buildProfileString', () => {
  test('includes formatted interests', () => {
    const result = buildProfileString(['indie-alternative', 'anime'], [], null);
    assert.ok(result.includes('Indie & Alternative'));
    assert.ok(result.includes('Anime'));
  });

  test('includes inner life when present', () => {
    const result = buildProfileString([], ['overthinker'], null);
    assert.ok(result.includes('overthinker'));
  });

  test('includes chapter when present', () => {
    const result = buildProfileString([], [], 'transition');
    assert.ok(result.includes('transition'));
  });

  test('returns fallback when all fields are empty', () => {
    assert.equal(buildProfileString([], [], null), 'Open to anything.');
  });

  test('combines all three fields', () => {
    const result = buildProfileString(['pop'], ['dreamer'], 'building');
    assert.ok(result.includes('Pop'));
    assert.ok(result.includes('dreamer'));
    assert.ok(result.includes('building'));
  });
});
