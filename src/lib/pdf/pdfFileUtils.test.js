import { describe, expect, it } from 'vitest';
import { isPdfFile } from './pdfFileUtils.js';

describe('pdfFileUtils', () => {
  it('detects PDF files by mime type', () => {
    expect(isPdfFile({ type: 'application/pdf', name: 'cert.pdf' })).toBe(true);
  });

  it('detects PDF files by extension', () => {
    expect(isPdfFile({ type: '', name: 'certificate.PDF' })).toBe(true);
  });

  it('rejects non-PDF files', () => {
    expect(isPdfFile({ type: 'image/png', name: 'background.png' })).toBe(false);
    expect(isPdfFile(null)).toBe(false);
  });
});
