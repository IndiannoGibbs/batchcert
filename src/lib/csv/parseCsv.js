import { BUILT_IN_CSV_HEADER_VARIANTS, NAME_COLUMN_VARIANTS, POSITION_COLUMN_VARIANTS } from '../../constants/index.js';

export const normalizeHeader = (value) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

export const parseCsvRow = (line) => {
  const rawParts = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(',');
  return rawParts.map(s => s.trim().replace(/^["']+|["']+$/g, '').replace(/""/g, '"'));
};

export const parseCsvText = (text) => {
  const lines = text.split(/\r\n|\n/).filter(l => l.trim() !== '');
  if (lines.length < 2) {
    return { error: 'CSV file must contain a header row and at least one data row.' };
  }

  const headers = parseCsvRow(lines[0]);
  const normalizedHeaders = headers.map(normalizeHeader);

  const rows = lines.slice(1).map((line, idx) => {
    const parts = parseCsvRow(line);
    const rowData = {};
    headers.forEach((h, hIdx) => {
      rowData[h] = parts[hIdx] || '';
    });
    return { id: idx, parts, rowData };
  });

  return { headers, normalizedHeaders, rows, lineCount: lines.length - 1 };
};

export const guessColumnIndex = (normalizedHeaders, variants) => {
  const normalizedVariants = variants.map(normalizeHeader);
  return normalizedHeaders.findIndex(h => normalizedVariants.includes(h));
};

export const guessDefaultMapping = (headers, normalizedHeaders) => {
  const nameIdx = guessColumnIndex(normalizedHeaders, NAME_COLUMN_VARIANTS);
  const posIdx = guessColumnIndex(normalizedHeaders, POSITION_COLUMN_VARIANTS);
  return {
    nameColumn: nameIdx >= 0 ? headers[nameIdx] : (headers[0] || ''),
    positionColumn: posIdx >= 0 ? headers[posIdx] : (headers[1] || ''),
  };
};

export const buildAwardeesFromCsv = ({ rows, nameColumn, positionColumn }) =>
  rows.map((row, idx) => {
    const nameVal = nameColumn ? (row.rowData[nameColumn] || '') : (row.parts[0] || '');
    const posVal = positionColumn ? (row.rowData[positionColumn] || '') : (row.parts[1] || '');

    return {
      id: String(Date.now() + idx),
      name: nameVal,
      position: posVal,
      csvData: row.rowData,
      hasCustomLayout: false,
      customElements: null,
      customSignatories: null,
    };
  }).filter(item =>
    item.name !== '' ||
    item.position !== '' ||
    Object.values(item.csvData || {}).some(v => v !== '')
  );

export const getCustomCsvHeaders = (headers, existingDynamicHeaders = new Set()) =>
  headers.filter((header) => {
    const normalized = header.trim().toLowerCase();
    return normalized && !BUILT_IN_CSV_HEADER_VARIANTS.has(normalized) && !existingDynamicHeaders.has(normalized);
  });

export const extractDynamicHeadersFromElements = (elements) => {
  const existingDynamicHeaders = new Set();
  (elements || []).forEach(el => {
    if (typeof el.text !== 'string') return;
    const matches = Array.from(el.text.matchAll(/\{\{\s*([^}]+)\s*\}\}/g));
    matches.forEach(match => {
      if (match[1]) existingDynamicHeaders.add(match[1].trim().toLowerCase());
    });
  });
  return existingDynamicHeaders;
};
