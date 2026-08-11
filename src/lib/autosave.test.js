import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { AUTOSAVE_KEY } from '../constants/index.js';
import {
  saveProjectToAutosave,
  loadAutosaveProject,
  getAutosaveProjectIfRestorable,
  clearAutosaveProject,
} from './autosave.js';

const createStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: (key) => { store.delete(key); },
    clear: () => { store.clear(); },
  };
};

const sampleProject = () => ({
  bgType: 'purpleGold',
  customBg: null,
  bgTransform: { width: 100, height: 100, x: 0, y: 0 },
  logoImg: null,
  globalData: {
    orgName: '',
    orgSubtext: '',
    dateLine: '',
    certificateTitle: '',
    eventDuties: '',
    bodyTemplate: '',
  },
  signatories: [{ id: 'sig_1', name: '', title: '', signatureImg: null }],
  awardees: [{
    id: '1',
    name: '',
    position: '',
    csvData: { Name: '', Position: '' },
    hasCustomLayout: false,
    customElements: null,
    customSignatories: null,
  }],
  csvHeaders: ['Name', 'Position'],
  elements: [{ id: 'text_1', type: 'text', text: 'Saved element' }],
  projectName: 'BatchCert_Project',
  canvasSize: { width: 1100, height: 850, label: 'US Letter Landscape' },
});

describe('autosave storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists and reloads a project with canvas elements', () => {
    const result = saveProjectToAutosave(sampleProject());
    expect(result.ok).toBe(true);
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeTruthy();

    const restored = getAutosaveProjectIfRestorable();
    expect(restored?.elements).toHaveLength(1);
    expect(restored?.elements[0].text).toBe('Saved element');
  });

  it('clears blank saves instead of storing them', () => {
    saveProjectToAutosave(sampleProject());
    const cleared = saveProjectToAutosave({
      ...sampleProject(),
      elements: [],
    });

    expect(cleared.cleared).toBe(true);
    expect(loadAutosaveProject()).toBeNull();
    expect(getAutosaveProjectIfRestorable()).toBeNull();
  });

  it('removes stale empty entries during restore checks', () => {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ elements: [], awardees: [] }));

    expect(getAutosaveProjectIfRestorable()).toBeNull();
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull();
  });

  it('clearAutosaveProject removes saved data', () => {
    saveProjectToAutosave(sampleProject());
    clearAutosaveProject();
    expect(getAutosaveProjectIfRestorable()).toBeNull();
  });
});
