export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  if (bytes < 1024 * 1024) return `~${Math.round(bytes / 1024)} KB`;
  return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  if (seconds < 60) return `~${Math.round(seconds)} sec`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `~${mins} min ${secs} sec` : `~${mins} min`;
};

export const estimateExport = ({
  count,
  canvasSize,
  exportScale,
  exportFormat,
}) => {
  const safeCount = Math.max(0, count || 0);
  const scale = Number(exportScale) || 2;
  const pixelCount = canvasSize.width * canvasSize.height * scale * scale;
  const compressionFactor = exportFormat === 'png' ? 0.55 : 0.12;
  const estimatedBytes = safeCount * pixelCount * compressionFactor;
  const perCertificateSeconds = exportFormat === 'png'
    ? 0.9 + scale * 0.35
    : 0.75 + scale * 0.25;
  const estimatedSeconds = safeCount * perCertificateSeconds;
  const memoryWarning = safeCount >= 50 && scale >= 3;
  const heavyBatch = safeCount >= 100;

  return {
    estimatedBytes,
    estimatedSeconds,
    memoryWarning,
    heavyBatch,
    formattedSize: formatBytes(estimatedBytes),
    formattedDuration: formatDuration(estimatedSeconds),
  };
};

export const getExportEstimateLabel = (estimate) => {
  if (!estimate) return '';
  const parts = [`Est. ${estimate.formattedSize}`, `Est. ${estimate.formattedDuration}`];
  if (estimate.memoryWarning) parts.push('High memory use at 3x scale');
  if (estimate.heavyBatch) parts.push('Large batch — keep this tab focused');
  return parts.join(' · ');
};
