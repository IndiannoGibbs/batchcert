import { describe, expect, it } from 'vitest';
import { estimateExport, formatBytes, formatDuration } from './estimateExport.js';

describe('estimateExport', () => {
  it('returns higher estimates for larger batches', () => {
    const small = estimateExport({
      count: 10,
      canvasSize: { width: 1100, height: 850 },
      exportScale: 2,
      exportFormat: 'pdf',
    });
    const large = estimateExport({
      count: 100,
      canvasSize: { width: 1100, height: 850 },
      exportScale: 2,
      exportFormat: 'pdf',
    });

    expect(large.estimatedBytes).toBeGreaterThan(small.estimatedBytes);
    expect(large.estimatedSeconds).toBeGreaterThan(small.estimatedSeconds);
  });

  it('flags memory warning for large 3x exports', () => {
    const result = estimateExport({
      count: 60,
      canvasSize: { width: 1100, height: 850 },
      exportScale: 3,
      exportFormat: 'pdf',
    });

    expect(result.memoryWarning).toBe(true);
  });

  it('formats bytes and duration', () => {
    expect(formatBytes(2048)).toContain('KB');
    expect(formatDuration(90)).toContain('sec');
  });
});
