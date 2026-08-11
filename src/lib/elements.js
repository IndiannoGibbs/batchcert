export const deduplicateElements = (els) => {
  const map = new Map();
  (els || []).forEach(el => {
    if (el.key === 'eventDuties') return;
    const identifier = el.sigId && el.sigField
      ? `sig_${el.sigId}_${el.sigField}`
      : (el.key ? `key_${el.key}` : el.id);
    map.set(identifier, el);
  });
  return Array.from(map.values());
};

export const getTextElementTransform = (el) => {
  if (el.type === 'logo' || el.align === 'center') return 'translateX(-50%)';
  if (el.type === 'text' && el.align === 'right') return 'translateX(-100%)';
  return 'none';
};
