import { GOOGLE_FONTS } from '../constants/index.js';

export function resolveFontFamily(fontKey) {
  const found = GOOGLE_FONTS.find(
    (font) => font.id === fontKey || font.id.toLowerCase() === fontKey?.toLowerCase()
  );
  if (found) return found.family;

  switch (fontKey) {
    case 'serif': return "'Georgia', 'Times New Roman', serif";
    case 'sans': return "'Inter', 'Helvetica', 'Arial', sans-serif";
    case 'cursive': return "'Great Vibes', 'Brush Script MT', cursive";
    case 'mono': return "'Courier New', monospace";
    default: return fontKey || 'sans-serif';
  }
}

export function renderTemplateText(rawText, awardee = {}, globalData = {}) {
  if (typeof rawText !== 'string' || rawText.indexOf('{{') === -1) {
    return rawText || '';
  }

  return rawText.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, keyName) => {
    const trimmedKey = keyName.trim();
    if (!trimmedKey) return match;
    if (trimmedKey.toLowerCase() === 'duties') return globalData.eventDuties || '';
    if (trimmedKey.toLowerCase() === 'name') return awardee.name || '';
    if (trimmedKey.toLowerCase() === 'position') return awardee.position || '';

    if (awardee.csvData) {
      if (awardee.csvData[trimmedKey] !== undefined) return awardee.csvData[trimmedKey];
      const matchedKey = Object.keys(awardee.csvData).find(
        (key) => key.toLowerCase() === trimmedKey.toLowerCase()
      );
      if (matchedKey) return awardee.csvData[matchedKey] || '';
    }

    if (awardee[trimmedKey] !== undefined) return awardee[trimmedKey];
    return match;
  });
}

export function getElementDisplayText(el, { awardee = {}, globalData = {}, signatories = [] } = {}) {
  let rawText = '';

  if (el.sigId) {
    const sig = signatories.find((item) => item.id === el.sigId);
    if (sig) rawText = sig[el.sigField] || '';
  } else if (el.type === 'qrcode') {
    rawText = el.data || '';
  } else if (el.text !== undefined && el.text !== null && !el.key) {
    rawText = el.text;
  } else {
    switch (el.key) {
      case 'orgName': rawText = globalData.orgName || ''; break;
      case 'orgSubtext': rawText = globalData.orgSubtext || ''; break;
      case 'certificateTitle': rawText = globalData.certificateTitle || ''; break;
      case 'bodyTemplate': {
        const template = globalData.bodyTemplate || '';
        const duties = globalData.eventDuties || '';
        rawText = template.includes('{{duties}}') ? template.replace(/\{\{duties\}\}/g, duties) : template;
        break;
      }
      case 'dateLine': rawText = globalData.dateLine || ''; break;
      case 'awardeeName': rawText = awardee.name || ''; break;
      case 'awardeePosition': rawText = awardee.position || ''; break;
      default: rawText = el.text || ''; break;
    }
  }

  return renderTemplateText(typeof rawText === 'string' ? rawText : '', awardee, globalData);
}

export function getLineElementStyle(el) {
  return {
    width: '100%',
    height: 0,
    border: 'none',
    borderTop: `${Math.max(1, el.height || 2)}px ${el.lineStyle || 'solid'} ${el.color || '#1f2937'}`,
  };
}
