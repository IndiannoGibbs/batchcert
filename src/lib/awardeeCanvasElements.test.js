import { describe, expect, it } from 'vitest';
import { ensureAwardeeFieldElements } from './awardeeCanvasElements.js';

describe('ensureAwardeeFieldElements', () => {
  it('adds name and position placeholders when missing', () => {
    const elements = ensureAwardeeFieldElements([], ['Name', 'Position']);
    expect(elements.some(el => el.key === 'awardeeName')).toBe(true);
    expect(elements.some(el => el.key === 'awardeePosition')).toBe(true);
    expect(elements.find(el => el.key === 'awardeeName').y).toBe(30);
    expect(elements.find(el => el.key === 'awardeePosition').y).toBe(40);
  });

  it('adds custom csv field elements for extra columns', () => {
    const elements = ensureAwardeeFieldElements(
      [{ id: '1', type: 'text', key: 'awardeeName', text: '', x: 50, y: 30 }],
      ['Name', 'Position', 'Department']
    );
    expect(elements.some(el => el.text === '{{Department}}')).toBe(true);
    expect(elements.find(el => el.text === '{{Department}}').y).toBe(58);
  });
});
