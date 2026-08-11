export const validateCsvImport = ({ headers, rows, nameColumn, positionColumn }) => {
  const issues = [];
  const warnings = [];

  if (!headers?.length) {
    issues.push('No column headers were found in the CSV file.');
  }

  if (!rows?.length) {
    issues.push('No data rows were found in the CSV file.');
  }

  if (nameColumn && !headers.includes(nameColumn)) {
    issues.push(`Mapped name column "${nameColumn}" was not found in the CSV headers.`);
  }

  if (positionColumn && !headers.includes(positionColumn)) {
    issues.push(`Mapped position column "${positionColumn}" was not found in the CSV headers.`);
  }

  if (!nameColumn) {
    warnings.push('No name column is mapped. Awardee names may be empty.');
  }

  const names = rows.map(row => (nameColumn ? row.rowData[nameColumn] : row.parts[0]) || '');
  const emptyNames = names.filter(name => !String(name).trim()).length;
  if (emptyNames > 0) {
    warnings.push(`${emptyNames} row(s) have an empty name value.`);
  }

  const trimmedNames = names.map(n => String(n).trim()).filter(Boolean);
  const seen = new Map();
  const duplicates = [];
  trimmedNames.forEach(name => {
    const key = name.toLowerCase();
    seen.set(key, (seen.get(key) || 0) + 1);
  });
  seen.forEach((count, name) => {
    if (count > 1) duplicates.push(name);
  });
  if (duplicates.length > 0) {
    warnings.push(`Duplicate names detected: ${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '…' : ''}`);
  }

  const emptyRows = rows.filter(row =>
    !Object.values(row.rowData).some(v => String(v).trim())
  ).length;
  if (emptyRows > 0) {
    warnings.push(`${emptyRows} completely empty row(s) will be skipped.`);
  }

  const validRows = rows.filter(row => {
    const nameVal = nameColumn ? row.rowData[nameColumn] : row.parts[0];
    const posVal = positionColumn ? row.rowData[positionColumn] : row.parts[1];
    return Boolean(String(nameVal || '').trim() || String(posVal || '').trim() || Object.values(row.rowData).some(v => String(v).trim()));
  });

  return {
    issues,
    warnings,
    stats: {
      totalRows: rows.length,
      validRows: validRows.length,
      emptyNames,
      duplicateNames: duplicates.length,
    },
    canImport: issues.length === 0 && validRows.length > 0,
  };
};
