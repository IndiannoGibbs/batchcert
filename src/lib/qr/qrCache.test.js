import { describe, expect, it } from 'vitest';
import { getQrCacheKey, generateQrDataUrl, clearQrCache } from './qrCache.js';

describe('qrCache', () => {
  it('builds stable cache keys', () => {
    expect(getQrCacheKey('https://example.com', 90)).toBe('https://example.com|90');
    expect(getQrCacheKey('  https://example.com  ', 90.4)).toBe('https://example.com|90');
  });

  it('generates a data URL and caches it', async () => {
    clearQrCache();
    const first = await generateQrDataUrl('https://batchcert.test/verify', 90);
    const second = await generateQrDataUrl('https://batchcert.test/verify', 90);

    expect(first).toMatch(/^data:image\/png;base64,/);
    expect(second).toBe(first);
  });
});
