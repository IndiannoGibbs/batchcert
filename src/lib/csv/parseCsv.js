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

const isNameHeader = (header) => normalizeHeader(header) === 'name';
const isPositionHeader = (header) =>
  POSITION_COLUMN_VARIANTS.some(variant => normalizeHeader(header) === normalizeHeader(variant));

export const findNameHeader = (headers = []) => headers.find(isNameHeader);
export const findPositionHeader = (headers = []) => headers.find(isPositionHeader);

export const getBulkEditHeaders = (csvHeaders = [], awardees = []) => {
  const headers = [...csvHeaders];
  const seen = new Set(headers.map(normalizeHeader));

  if (!headers.some(isNameHeader)) {
    headers.unshift('Name');
    seen.add('name');
  }

  if (!headers.some(isPositionHeader)) {
    const nameIdx = headers.findIndex(isNameHeader);
    headers.splice(nameIdx >= 0 ? nameIdx + 1 : 0, 0, 'Position');
    seen.add('position');
  }

  awardees.forEach((awardee) => {
    Object.keys(awardee.csvData || {}).forEach((key) => {
      const normalized = normalizeHeader(key);
      if (!key || seen.has(normalized)) return;
      seen.add(normalized);
      headers.push(key);
    });
  });

  return headers;
};

export const getAwardeeFieldValue = (awardee, header) => {
  if (isNameHeader(header)) {
    return awardee.name || awardee.csvData?.[header] || awardee.csvData?.Name || '';
  }
  if (isPositionHeader(header)) {
    return awardee.position || awardee.csvData?.[header] || awardee.csvData?.Position || '';
  }
  return awardee.csvData?.[header] ?? '';
};

export const applyBulkEditRow = (awardee, row, editHeaders) => {
  const csvData = { ...(awardee.csvData || {}) };
  editHeaders.forEach((header) => {
    csvData[header] = row[header] ?? '';
  });

  const nameHeader = findNameHeader(editHeaders) || 'Name';
  const positionHeader = findPositionHeader(editHeaders) || 'Position';

  return {
    ...awardee,
    name: row[nameHeader] ?? csvData[nameHeader] ?? awardee.name,
    position: row[positionHeader] ?? csvData[positionHeader] ?? awardee.position,
    csvData,
  };
};

export const isBulkEditRowEmpty = (row, editHeaders) =>
  editHeaders.every(header => String(row[header] ?? '').trim() === '');

export const createEmptyBulkEditRow = (editHeaders, id = `new_${Date.now()}`) => {
  const row = { _id: id };
  editHeaders.forEach((header) => {
    row[header] = '';
  });
  return row;
};

export const createAwardeeFromRow = (row, editHeaders) => {
  const csvData = {};
  editHeaders.forEach((header) => {
    csvData[header] = row[header] ?? '';
  });

  const nameHeader = findNameHeader(editHeaders) || 'Name';
  const positionHeader = findPositionHeader(editHeaders) || 'Position';

  return {
    id: row._id && !String(row._id).startsWith('new_') ? row._id : String(Date.now() + Math.random()),
    name: String(row[nameHeader] ?? '').trim(),
    position: String(row[positionHeader] ?? '').trim(),
    csvData,
    hasCustomLayout: false,
    customElements: null,
    customSignatories: null,
  };
};

export const bulkEditRowsToAwardees = (rows, editHeaders, existingAwardees = []) => {
  const existingById = new Map(existingAwardees.map(awardee => [awardee.id, awardee]));

  return rows
    .filter(row => !isBulkEditRowEmpty(row, editHeaders))
    .map((row) => {
      const existing = row._id ? existingById.get(row._id) : null;
      if (existing) return applyBulkEditRow(existing, row, editHeaders);
      return createAwardeeFromRow(row, editHeaders);
    });
};
