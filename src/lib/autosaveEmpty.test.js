import { describe, expect, it } from 'vitest';
import { isAutosaveEmpty } from './autosaveEmpty.js';

const blankState = () => ({
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
  elements: [],
  projectName: 'BatchCert_Project',
  canvasSize: { width: 1100, height: 850, label: 'US Letter Landscape' },
});

describe('isAutosaveEmpty', () => {
  it('treats the default blank project as empty', () => {
    expect(isAutosaveEmpty(blankState())).toBe(true);
  });

  it('detects canvas element changes', () => {
    const state = blankState();
    state.elements = [{ id: 'text_1', type: 'text', text: 'Hello' }];
    expect(isAutosaveEmpty(state)).toBe(false);
  });

  it('detects awardee name changes', () => {
    const state = blankState();
    state.awardees[0].name = 'Jane Doe';
    expect(isAutosaveEmpty(state)).toBe(false);
  });

  it('detects global header changes', () => {
    const state = blankState();
    state.globalData.orgName = 'BatchCert University';
    expect(isAutosaveEmpty(state)).toBe(false);
  });

  it('detects background style changes', () => {
    const state = blankState();
    state.bgType = 'gold';
    expect(isAutosaveEmpty(state)).toBe(false);
  });
});
