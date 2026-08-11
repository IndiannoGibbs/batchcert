import { describe, expect, it } from 'vitest';
import { normalizeLoadedProjectState } from './projectState.js';
import { isAutosaveEmpty } from './autosaveEmpty.js';

describe('normalizeLoadedProjectState', () => {
  it('fills missing fields from a saved project export', () => {
    const normalized = normalizeLoadedProjectState({
      projectName: 'My Event',
      elements: [{ id: 'text_1', type: 'text', text: 'Hello' }],
      awardees: [{ id: '1', name: 'Jane Doe', position: 'Lead', csvData: { Name: 'Jane Doe', Position: 'Lead' } }],
    });

    expect(normalized.projectName).toBe('My Event');
    expect(normalized.elements).toHaveLength(1);
    expect(normalized.bgTransform).toEqual({ width: 100, height: 100, x: 0, y: 0 });
    expect(isAutosaveEmpty(normalized)).toBe(false);
  });

  it('treats missing elements as an empty canvas', () => {
    const normalized = normalizeLoadedProjectState({
      projectName: 'Layout Only',
      awardees: [{ id: '1', name: 'Jane Doe', position: '', csvData: { Name: 'Jane Doe', Position: '' } }],
    });

    expect(normalized.elements).toEqual([]);
    expect(isAutosaveEmpty(normalized)).toBe(false);
  });

  it('maps layout template names onto projectName', () => {
    const normalized = normalizeLoadedProjectState({
      templateName: 'Annual_Event_Layout',
      elements: [{ id: 'text_1', type: 'text', text: 'Title' }],
    });

    expect(normalized.projectName).toBe('Annual_Event_Layout');
    expect(isAutosaveEmpty(normalized)).toBe(false);
  });
});
