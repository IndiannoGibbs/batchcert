import JSZip from 'jszip';
import {
  createCertificatePdf,
  addCertificatePdfPage,
  addCertificatePdfImage,
} from './pdfHelpers.js';
import { captureCanvasForExport } from './captureCanvas.js';
import { waitForCanvasRender, prepareCanvasForCapture } from './waitForRender.js';

const disposeCapture = (capture) => {
  if (capture?.renderedCanvas) {
    capture.renderedCanvas.width = 0;
    capture.renderedCanvas.height = 0;
  }
};

const shouldCancel = (isCancelled) => typeof isCancelled === 'function' && isCancelled();

export const prepareExportEnvironment = async (canvasRef) => {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  if (canvasRef?.current) {
    await prepareCanvasForCapture(canvasRef.current);
  } else {
    await waitForCanvasRender();
  }
};

export const exportBatchZip = async ({
  canvasRef,
  canvasSize,
  exportScale,
  awardees,
  projectName,
  exportMode,
  selectedExportIndices,
  exportFormat,
  setCurrentAwardeeIdx,
  onProgress,
  isCancelled,
  chunkSize = 10,
}) => {
  const zip = new JSZip();
  const indicesToExport = exportMode === 'all'
    ? awardees.map((_, idx) => idx)
    : selectedExportIndices;

  for (let i = 0; i < indicesToExport.length; i++) {
    if (shouldCancel(isCancelled)) break;

    const awardeeIdx = indicesToExport[i];
    setCurrentAwardeeIdx(awardeeIdx);
    onProgress?.(Math.round(((i + 1) / indicesToExport.length) * 100));

    await waitForCanvasRender();
    if (canvasRef.current) {
      await prepareCanvasForCapture(canvasRef.current);
    }

    const capture = await captureCanvasForExport(canvasRef.current, { canvasSize, exportScale });
    if (!capture) continue;

    const awardeeObj = awardees[awardeeIdx];
    const safeName = (awardeeObj.name || `Awardee_${awardeeIdx + 1}`).replace(/[^a-zA-Z0-9]/g, '_');

    if (exportFormat === 'pdf') {
      const pdf = createCertificatePdf(capture.pageWidth, capture.pageHeight);
      addCertificatePdfImage(pdf, capture.imgData);
      zip.file(`BatchCert_${awardeeIdx + 1}_${safeName}.pdf`, pdf.output('blob'));
    } else {
      const pngBlob = await new Promise((resolve) => capture.renderedCanvas.toBlob(resolve, 'image/png'));
      zip.file(`BatchCert_${awardeeIdx + 1}_${safeName}.png`, pngBlob);
    }

    disposeCapture(capture);

    if ((i + 1) % chunkSize === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  if (shouldCancel(isCancelled)) return;

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName || 'BatchCert_Archive'}_${exportFormat.toUpperCase()}.zip`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportSinglePdf = async ({
  canvasRef,
  canvasSize,
  exportScale,
  awardees,
  indices,
  setCurrentAwardeeIdx,
  onProgress,
  isCancelled,
  filename = 'batch_certificates_all.pdf',
}) => {
  const indicesToExport = indices ?? awardees.map((_, idx) => idx);
  let pdf = null;

  for (let i = 0; i < indicesToExport.length; i++) {
    if (shouldCancel(isCancelled)) break;

    const awardeeIdx = indicesToExport[i];
    setCurrentAwardeeIdx(awardeeIdx);
    onProgress?.(Math.round(((i + 1) / indicesToExport.length) * 100));

    await waitForCanvasRender();
    if (canvasRef.current) {
      await prepareCanvasForCapture(canvasRef.current);
    }

    const capture = await captureCanvasForExport(canvasRef.current, { canvasSize, exportScale });
    if (!capture) continue;

    if (!pdf) {
      pdf = createCertificatePdf(capture.pageWidth, capture.pageHeight);
    } else {
      addCertificatePdfPage(pdf, capture.pageWidth, capture.pageHeight);
    }
    addCertificatePdfImage(pdf, capture.imgData);
    disposeCapture(capture);

    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  if (shouldCancel(isCancelled) || !pdf) return;

  pdf.save(filename);
};

export const exportTestCertificate = async ({
  canvasRef,
  canvasSize,
  exportScale,
  awardeeIdx,
  setCurrentAwardeeIdx,
  filename = 'batchcert_test_certificate.pdf',
}) => {
  await prepareExportEnvironment(canvasRef);
  setCurrentAwardeeIdx(awardeeIdx);
  await waitForCanvasRender();
  if (canvasRef.current) {
    await prepareCanvasForCapture(canvasRef.current);
  }

  const capture = await captureCanvasForExport(canvasRef.current, { canvasSize, exportScale });
  if (!capture) return;

  const pdf = createCertificatePdf(capture.pageWidth, capture.pageHeight);
  addCertificatePdfImage(pdf, capture.imgData);
  pdf.save(filename);
  disposeCapture(capture);
};
