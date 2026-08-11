import { deduplicateElements } from './elements.js';

const DEFAULT_BG_TRANSFORM = { width: 100, height: 100, x: 0, y: 0 };
const DEFAULT_CANVAS_SIZE = { width: 1100, height: 850, label: 'US Letter Landscape' };
const DEFAULT_GLOBAL_DATA = {
  orgName: '',
  orgSubtext: '',
  dateLine: '',
  certificateTitle: '',
  eventDuties: '',
  bodyTemplate: '',
};
const DEFAULT_AWARDEE = {
  id: '1',
  name: '',
  position: '',
  csvData: { Name: '', Position: '' },
  hasCustomLayout: false,
  customElements: null,
  customSignatories: null,
};

export const buildProjectSnapshot = (state) => ({
  bgType: state.bgType,
  customBg: state.customBg,
  bgTransform: state.bgTransform,
  logoImg: state.logoImg,
  globalData: state.globalData,
  signatories: state.signatories,
  awardees: state.awardees,
  csvHeaders: state.csvHeaders,
  elements: state.elements,
  projectName: state.projectName,
  canvasSize: state.canvasSize,
});

export const normalizeLoadedProjectState = (state) => buildProjectSnapshot({
  bgType: state?.bgType ?? 'purpleGold',
  customBg: state?.customBg ?? null,
  bgTransform: state?.bgTransform ?? DEFAULT_BG_TRANSFORM,
  logoImg: state?.logoImg ?? null,
  globalData: state?.globalData ?? DEFAULT_GLOBAL_DATA,
  signatories: state?.signatories ?? [{ id: 'sig_1', name: '', title: '', signatureImg: null }],
  awardees: state?.awardees ?? [DEFAULT_AWARDEE],
  csvHeaders: state?.csvHeaders ?? ['Name', 'Position'],
  elements: Array.isArray(state?.elements) ? state.elements : [],
  projectName: state?.projectName ?? state?.templateName ?? 'BatchCert_Project',
  canvasSize: state?.canvasSize ?? DEFAULT_CANVAS_SIZE,
});

export const createHistoryFromProject = (state, fallbacks = {}) => {
  const cleaned = deduplicateElements(state.elements || []);
  return [{
    elements: cleaned,
    globalData: state.globalData ?? fallbacks.globalData,
    awardees: state.awardees ?? fallbacks.awardees,
    signatories: state.signatories ?? fallbacks.signatories,
  }];
};

export const getProjectAppliers = ({
  setBgType,
  setCustomBg,
  setBgTransform,
  setLogoImg,
  setGlobalData,
  setSignatories,
  setAwardees,
  setCsvHeaders,
  setProjectName,
  setCanvasSize,
  setElements,
  setHistory,
  setHistoryIndex,
  fallbacks,
}) => (state) => {
  if (state.bgType !== undefined && state.bgType !== null) setBgType(state.bgType);
  if (state.customBg !== undefined) setCustomBg(state.customBg);
  if (state.bgTransform) setBgTransform(state.bgTransform);
  if (state.logoImg !== undefined) setLogoImg(state.logoImg);
  if (state.globalData) setGlobalData(state.globalData);
  if (state.signatories) setSignatories(state.signatories);
  if (state.awardees) setAwardees(state.awardees);
  if (state.csvHeaders) setCsvHeaders(state.csvHeaders);
  if (state.projectName !== undefined && state.projectName !== null) setProjectName(state.projectName);
  if (state.canvasSize) setCanvasSize(state.canvasSize);
  if (Array.isArray(state.elements)) {
    const cleaned = deduplicateElements(state.elements);
    setElements(cleaned);
    setHistory(createHistoryFromProject({ ...state, elements: cleaned }, fallbacks));
    setHistoryIndex(0);
  }
};
