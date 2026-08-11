const DEFAULT_BG_TRANSFORM = { width: 100, height: 100, x: 0, y: 0 };
const DEFAULT_CANVAS_SIZE = { width: 1100, height: 850, label: 'US Letter Landscape' };

export const isAutosaveEmpty = (state) => {
  if (!state) return true;

  const awardees = state.awardees || [];
  const hasAwardeeData = awardees.some((awardee) =>
    (awardee.name || '').trim() ||
    (awardee.position || '').trim() ||
    awardee.hasCustomLayout ||
    (Array.isArray(awardee.customElements) && awardee.customElements.length > 0) ||
    Object.values(awardee.csvData || {}).some((value) => String(value || '').trim())
  );
  const hasMultipleAwardees = awardees.length > 1;
  const hasElements = (state.elements || []).length > 0;
  const hasGlobal = Object.values(state.globalData || {}).some((value) => String(value || '').trim());
  const hasAssets = Boolean(state.customBg || state.logoImg);
  const hasSignatoryData = (state.signatories || []).some((sig) =>
    (sig.name || '').trim() || (sig.title || '').trim() || sig.signatureImg
  );
  const transform = { ...DEFAULT_BG_TRANSFORM, ...(state.bgTransform || {}) };
  const canvasSize = { ...DEFAULT_CANVAS_SIZE, ...(state.canvasSize || {}) };
  const hasDesignChanges =
    (state.bgType && state.bgType !== 'purpleGold') ||
    Boolean(state.customBg) ||
    transform.width !== DEFAULT_BG_TRANSFORM.width ||
    transform.height !== DEFAULT_BG_TRANSFORM.height ||
    transform.x !== DEFAULT_BG_TRANSFORM.x ||
    transform.y !== DEFAULT_BG_TRANSFORM.y ||
    canvasSize.width !== DEFAULT_CANVAS_SIZE.width ||
    canvasSize.height !== DEFAULT_CANVAS_SIZE.height;
  const hasProjectMeta = Boolean(
    (state.projectName && state.projectName !== 'BatchCert_Project') ||
    (Array.isArray(state.csvHeaders) && state.csvHeaders.length > 2)
  );

  return !(
    hasAwardeeData ||
    hasMultipleAwardees ||
    hasElements ||
    hasGlobal ||
    hasAssets ||
    hasSignatoryData ||
    hasDesignChanges ||
    hasProjectMeta
  );
};
