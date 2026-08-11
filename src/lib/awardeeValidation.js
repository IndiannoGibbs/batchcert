export const validateAwardees = (awardees = []) => {
  const warnings = [];
  const issues = [];

  if (!awardees.length) {
    issues.push('No awardees in the project.');
    return { issues, warnings, stats: { total: 0, emptyNames: 0, duplicateNames: 0 } };
  }

  const emptyNames = awardees.filter(a => !String(a.name || '').trim()).length;
  if (emptyNames > 0) {
    warnings.push(`${emptyNames} awardee(s) are missing a name.`);
  }

  const nameCounts = new Map();
  awardees.forEach((a) => {
    const name = String(a.name || '').trim().toLowerCase();
    if (!name) return;
    nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
  });

  const duplicateNames = [...nameCounts.entries()].filter(([, count]) => count > 1);
  if (duplicateNames.length > 0) {
    const preview = duplicateNames.slice(0, 3).map(([name]) => name).join(', ');
    warnings.push(`Duplicate names detected: ${preview}${duplicateNames.length > 3 ? '…' : ''}`);
  }

  const customLayouts = awardees.filter(a => a.hasCustomLayout).length;
  if (customLayouts > 0) {
    warnings.push(`${customLayouts} awardee(s) use a custom layout override.`);
  }

  return {
    issues,
    warnings,
    stats: {
      total: awardees.length,
      emptyNames,
      duplicateNames: duplicateNames.length,
      customLayouts,
    },
  };
};
