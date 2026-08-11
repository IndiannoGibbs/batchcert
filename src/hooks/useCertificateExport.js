import { useCallback, useRef, useState } from 'react';
import {
  prepareExportEnvironment,
  exportBatchZip,
  exportSinglePdf,
  exportTestCertificate,
} from '../lib/export/exportService.js';

export function useCertificateExport({
  canvasRef,
  canvasSize,
  exportScale,
  awardees,
  projectName,
  currentAwardeeIdx,
  setCurrentAwardeeIdx,
  setSelectedIds,
  setEditingElementId,
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusLabel, setExportStatusLabel] = useState('');
  const cancelExportRef = useRef(false);

  const isCancelled = useCallback(() => cancelExportRef.current, []);

  const cancelExport = useCallback(() => {
    cancelExportRef.current = true;
    setExportStatusLabel('Cancelling…');
  }, []);

  const executeBatchZipExport = useCallback(async ({
    exportMode,
    selectedExportIndices,
    exportFormat,
    onCloseModal,
  }) => {
    if (!canvasRef.current) return;
    onCloseModal?.();
    cancelExportRef.current = false;
    setIsExporting(true);
    setSelectedIds([]);
    setEditingElementId?.(null);
    setExportProgress(0);
    setExportStatusLabel('Preparing export…');
    const initialIdx = currentAwardeeIdx;

    try {
      await prepareExportEnvironment(canvasRef);
      await exportBatchZip({
        canvasRef,
        canvasSize,
        exportScale,
        awardees,
        projectName,
        exportMode,
        selectedExportIndices,
        exportFormat,
        setCurrentAwardeeIdx,
        onProgress: setExportProgress,
        isCancelled,
      });
    } finally {
      setCurrentAwardeeIdx(initialIdx);
      setIsExporting(false);
      setExportProgress(0);
      setExportStatusLabel('');
      cancelExportRef.current = false;
    }
  }, [canvasRef, canvasSize, exportScale, awardees, projectName, setCurrentAwardeeIdx, setSelectedIds, setEditingElementId, currentAwardeeIdx, isCancelled]);

  const exportAllToSinglePDF = useCallback(async ({
    exportMode = 'all',
    selectedExportIndices = [],
    onCloseModal,
  } = {}) => {
    if (!canvasRef.current || awardees.length === 0) return;

    const indices = exportMode === 'selected'
      ? selectedExportIndices
      : awardees.map((_, idx) => idx);
    if (indices.length === 0) return;

    onCloseModal?.();
    const initialIdx = currentAwardeeIdx;
    cancelExportRef.current = false;
    setIsExporting(true);
    setSelectedIds([]);
    setEditingElementId?.(null);
    setExportProgress(0);
    setExportStatusLabel('Building multi-page PDF…');

    try {
      await prepareExportEnvironment(canvasRef);
      await exportSinglePdf({
        canvasRef,
        canvasSize,
        exportScale,
        awardees,
        indices,
        setCurrentAwardeeIdx,
        onProgress: setExportProgress,
        isCancelled,
      });
    } finally {
      setCurrentAwardeeIdx(initialIdx);
      setIsExporting(false);
      setExportProgress(0);
      setExportStatusLabel('');
      cancelExportRef.current = false;
    }
  }, [canvasRef, canvasSize, exportScale, awardees, currentAwardeeIdx, setCurrentAwardeeIdx, setSelectedIds, setEditingElementId, isCancelled]);

  const exportTestPdf = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    setSelectedIds([]);
    setEditingElementId?.(null);
    setExportStatusLabel('Rendering preview PDF…');
    try {
      await exportTestCertificate({
        canvasRef,
        canvasSize,
        exportScale,
        awardeeIdx: currentAwardeeIdx,
        setCurrentAwardeeIdx,
      });
    } finally {
      setIsExporting(false);
      setExportStatusLabel('');
    }
  }, [canvasRef, canvasSize, exportScale, currentAwardeeIdx, setCurrentAwardeeIdx, setSelectedIds, setEditingElementId]);

  return {
    isExporting,
    exportProgress,
    exportStatusLabel,
    executeBatchZipExport,
    exportAllToSinglePDF,
    exportTestPdf,
    cancelExport,
  };
}
