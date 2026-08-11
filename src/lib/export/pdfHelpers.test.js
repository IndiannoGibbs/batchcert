import { describe, expect, it } from 'vitest';
import { getPdfOrientation, getExportSummary } from './pdfHelpers.js';

describe('getPdfOrientation', () => {
  it('returns landscape when width >= height', () => {
    expect(getPdfOrientation(1100, 850)).toBe('landscape');
    expect(getPdfOrientation(1123, 794)).toBe('landscape');
    expect(getPdfOrientation(1000, 1000)).toBe('landscape');
  });

  it('returns portrait when height > width', () => {
    expect(getPdfOrientation(850, 1100)).toBe('portrait');
    expect(getPdfOrientation(794, 1123)).toBe('portrait');
  });
});

describe('getExportSummary', () => {
  it('describes landscape export settings', () => {
    const summary = getExportSummary({
      canvasSize: { width: 1100, height: 850 },
      awardeeCount: 121,
      exportScale: 2,
      exportFormat: 'pdf',
    });
    expect(summary).toContain('121 certificate(s)');
    expect(summary).toContain('1100×850px landscape');
    expect(summary).toContain('2x');
    expect(summary).toContain('PDF');
  });
});
