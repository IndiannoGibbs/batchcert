import { describe, expect, it } from 'vitest';
import { parseCsvText, guessDefaultMapping, buildAwardeesFromCsv } from './parseCsv.js';
import { validateCsvImport } from './validateCsv.js';

const SAMPLE_CSV = `Name,Position,Department
Rio Anne,DChair,Music
John Doe,,Science
,Secretary,Admin`;

describe('parseCsvText', () => {
  it('parses headers and rows', () => {
    const result = parseCsvText(SAMPLE_CSV);
    expect(result.headers).toEqual(['Name', 'Position', 'Department']);
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0].rowData.Department).toBe('Music');
  });

  it('returns error for invalid csv', () => {
    expect(parseCsvText('OnlyHeader')).toEqual({
      error: 'CSV file must contain a header row and at least one data row.',
    });
  });
});

describe('guessDefaultMapping', () => {
  it('maps common name and position headers', () => {
    const parsed = parseCsvText(SAMPLE_CSV);
    const mapping = guessDefaultMapping(parsed.headers, parsed.normalizedHeaders);
    expect(mapping.nameColumn).toBe('Name');
    expect(mapping.positionColumn).toBe('Position');
  });
});

describe('validateCsvImport', () => {
  it('flags empty names and duplicates', () => {
    const parsed = parseCsvText(`Name,Position
Alice,Chair
Alice,Co-Chair
"",Empty`);
    const validation = validateCsvImport({
      headers: parsed.headers,
      rows: parsed.rows,
      nameColumn: 'Name',
      positionColumn: 'Position',
    });
    expect(validation.canImport).toBe(true);
    expect(validation.stats.emptyNames).toBe(1);
    expect(validation.stats.duplicateNames).toBe(1);
    expect(validation.warnings.length).toBeGreaterThan(0);
  });
});

describe('buildAwardeesFromCsv', () => {
  it('builds awardee records using mapped columns', () => {
    const parsed = parseCsvText(SAMPLE_CSV);
    const awardees = buildAwardeesFromCsv({
      rows: parsed.rows,
      nameColumn: 'Name',
      positionColumn: 'Position',
    });
    expect(awardees[0].name).toBe('Rio Anne');
    expect(awardees[0].csvData.Department).toBe('Music');
  });
});
