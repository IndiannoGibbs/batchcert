import { jsPDF } from 'jspdf';

export const getPdfOrientation = (pageWidth, pageHeight) =>
  pageWidth >= pageHeight ? 'landscape' : 'portrait';

export const createCertificatePdf = (pageWidth, pageHeight) =>
  new jsPDF({
    orientation: getPdfOrientation(pageWidth, pageHeight),
    unit: 'px',
    format: [pageWidth, pageHeight],
  });

export const addCertificatePdfPage = (pdf, pageWidth, pageHeight) => {
  pdf.addPage([pageWidth, pageHeight], getPdfOrientation(pageWidth, pageHeight));
};

export const addCertificatePdfImage = (pdf, imgData) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
};

export const getExportSummary = ({ canvasSize, awardeeCount, exportScale, exportFormat }) => {
  const orientation = getPdfOrientation(canvasSize.width, canvasSize.height);
  return `${awardeeCount} certificate(s) · ${canvasSize.width}×${canvasSize.height}px ${orientation} · ${exportScale}x · ${exportFormat.toUpperCase()}`;
};
