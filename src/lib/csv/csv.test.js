import { describe, expect, it } from 'vitest';
import {
  parseCsvText,
  guessDefaultMapping,
  buildAwardeesFromCsv,
  getBulkEditHeaders,
  applyBulkEditRow,
  bulkEditRowsToAwardees,
} from './parseCsv.js';
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

describe('getBulkEditHeaders', () => {
  it('adds Position when CSV only had Name', () => {
    const awardees = [
      { name: 'Alice', position: 'Chair', csvData: { Name: 'Alice' } },
    ];
    expect(getBulkEditHeaders(['Name'], awardees)).toEqual(['Name', 'Position']);
  });

  it('preserves custom CSV columns', () => {
    const awardees = [
      { name: 'Alice', position: 'Chair', csvData: { Name: 'Alice', Department: 'Science' } },
    ];
    expect(getBulkEditHeaders(['Name'], awardees)).toEqual(['Name', 'Position', 'Department']);
  });
});

describe('applyBulkEditRow', () => {
  it('updates name and position from bulk edit row', () => {
    const awardee = { name: 'Alice', position: '', csvData: { Name: 'Alice' } };
    const headers = ['Name', 'Position'];
    const updated = applyBulkEditRow(awardee, { Name: 'Alice B.', Position: 'Director' }, headers);
    expect(updated.name).toBe('Alice B.');
    expect(updated.position).toBe('Director');
    expect(updated.csvData.Position).toBe('Director');
  });
});

describe('bulkEditRowsToAwardees', () => {
  it('creates new awardees from added rows and skips empty rows', () => {
    const existing = [
      { id: 'a1', name: 'Alice', position: 'Chair', csvData: { Name: 'Alice', Position: 'Chair' } },
    ];
    const rows = [
      { _id: 'a1', Name: 'Alice Updated', Position: 'Chair' },
      { _id: 'new_1', Name: 'Bob', Position: 'Secretary' },
      { _id: 'new_2', Name: '', Position: '' },
    ];
    const result = bulkEditRowsToAwardees(rows, ['Name', 'Position'], existing);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice Updated');
    expect(result[1].name).toBe('Bob');
    expect(result[1].position).toBe('Secretary');
  });

  it('removes awardees when rows are deleted', () => {
    const existing = [
      { id: 'a1', name: 'Alice', position: '', csvData: { Name: 'Alice' } },
      { id: 'a2', name: 'Bob', position: '', csvData: { Name: 'Bob' } },
    ];
    const rows = [{ _id: 'a1', Name: 'Alice', Position: '' }];
    const result = bulkEditRowsToAwardees(rows, ['Name', 'Position'], existing);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a1');
  });
});
