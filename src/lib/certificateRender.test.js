import { describe, expect, it } from 'vitest';
import { getElementDisplayText, renderTemplateText } from './certificateRender.js';

describe('certificateRender', () => {
  it('replaces awardee template tags', () => {
    const text = renderTemplateText('Awarded to {{Name}} — {{Position}}', {
      name: 'Jane Doe',
      position: 'Director',
    });

    expect(text).toBe('Awarded to Jane Doe — Director');
  });

  it('resolves awardee name fields for display', () => {
    const html = getElementDisplayText(
      { type: 'text', key: 'awardeeName' },
      {
        awardee: { name: 'Jane Doe', position: 'Director' },
        globalData: {},
        signatories: [],
      }
    );

    expect(html).toBe('Jane Doe');
  });
});
