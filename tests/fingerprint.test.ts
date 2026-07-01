import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { buildFingerprint } from '../lib/fingerprint.js';

describe('buildFingerprint', () => {
  test('returns a 16-character hex string', () => {
    const result = buildFingerprint([{ rendered_text: 'hello' }]);
    assert.match(result, /^[0-9a-f]{16}$/);
  });

  test('returns the same fingerprint for the same input', () => {
    const rows = [{ rendered_text: 'first' }, { rendered_text: 'second' }];
    assert.equal(buildFingerprint(rows), buildFingerprint(rows));
  });

  test('returns a different fingerprint when a reflection is added', () => {
    const before = [{ rendered_text: 'first' }];
    const after = [{ rendered_text: 'first' }, { rendered_text: 'second' }];
    assert.notEqual(buildFingerprint(before), buildFingerprint(after));
  });

  test('returns a different fingerprint when a reflection is edited', () => {
    const before = [{ rendered_text: 'original text' }];
    const after = [{ rendered_text: 'edited text' }];
    assert.notEqual(buildFingerprint(before), buildFingerprint(after));
  });

  test('returns a different fingerprint when a reflection is deleted', () => {
    const before = [{ rendered_text: 'first' }, { rendered_text: 'second' }];
    const after = [{ rendered_text: 'first' }];
    assert.notEqual(buildFingerprint(before), buildFingerprint(after));
  });

  test('handles an empty array', () => {
    const result = buildFingerprint([]);
    assert.match(result, /^[0-9a-f]{16}$/);
  });
});
