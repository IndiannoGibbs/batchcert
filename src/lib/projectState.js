import { deduplicateElements } from './elements.js';

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
  if (state.bgType) setBgType(state.bgType);
  if (state.customBg !== undefined) setCustomBg(state.customBg);
  if (state.bgTransform) setBgTransform(state.bgTransform);
  if (state.logoImg !== undefined) setLogoImg(state.logoImg);
  if (state.globalData) setGlobalData(state.globalData);
  if (state.signatories) setSignatories(state.signatories);
  if (state.awardees) setAwardees(state.awardees);
  if (state.csvHeaders) setCsvHeaders(state.csvHeaders);
  if (state.projectName) setProjectName(state.projectName);
  if (state.canvasSize) setCanvasSize(state.canvasSize);
  if (state.elements) {
    const cleaned = deduplicateElements(state.elements);
    setElements(cleaned);
    setHistory(createHistoryFromProject({ ...state, elements: cleaned }, fallbacks));
    setHistoryIndex(0);
  }
};
