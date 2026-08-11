import {
  extractDynamicHeadersFromElements,
  getCustomCsvHeaders,
} from './csv/parseCsv.js';

export function ensureAwardeeFieldElements(elements = [], headers = []) {
  const awardeeNameMissing = !elements.some(el => el.key === 'awardeeName');
  const awardeePositionMissing = !elements.some(el => el.key === 'awardeePosition');
  const existingDynamicHeaders = extractDynamicHeadersFromElements(elements);
  const customHeaders = getCustomCsvHeaders(headers, existingDynamicHeaders);

  const newElements = [];
  const stamp = Date.now();

  if (awardeeNameMissing) {
    newElements.push({
      id: `field_awardeeName_${stamp}`,
      type: 'text',
      key: 'awardeeName',
      label: 'Awardee Name',
      text: '',
      x: 50,
      y: 30,
      font: 'Cinzel',
      fontSize: 32,
      color: '#1f2937',
      bold: true,
      italic: false,
      underline: false,
      align: 'center',
      maxWidth: 80,
      visible: true,
    });
  }

  if (awardeePositionMissing) {
    newElements.push({
      id: `field_awardeePosition_${stamp + 1}`,
      type: 'text',
      key: 'awardeePosition',
      label: 'Awardee Position',
      text: '',
      x: 50,
      y: 40,
      font: 'Montserrat',
      fontSize: 20,
      color: '#1f2937',
      bold: true,
      italic: false,
      underline: false,
      align: 'center',
      maxWidth: 80,
      visible: true,
    });
  }

  customHeaders.forEach((header, idx) => {
    newElements.push({
      id: `field_csv_${stamp}_${idx}`,
      type: 'text',
      text: `{{${header}}}`,
      label: header,
      x: 50,
      y: 58 + idx * 8,
      font: 'Inter',
      fontSize: 20,
      color: '#1f2937',
      bold: false,
      italic: false,
      underline: false,
      align: 'center',
      maxWidth: 80,
      visible: true,
    });
  });

  return newElements;
}
