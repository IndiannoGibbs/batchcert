import html2canvas from 'html2canvas';
import { inlineQrCodesInElement, waitForImages } from '../qr/qrCache.js';

export const captureCanvasForExport = async (canvasElement, { canvasSize, exportScale }) => {
  if (!canvasElement) return null;

  const renderScale = Number(exportScale);
  const pageWidth = canvasSize.width;
  const pageHeight = canvasSize.height;

  const sandbox = document.createElement('div');
  sandbox.setAttribute('aria-hidden', 'true');
  sandbox.style.cssText = [
    'position: fixed',
    'left: -99999px',
    'top: 0',
    `width: ${pageWidth}px`,
    `height: ${pageHeight}px`,
    'overflow: visible',
    'pointer-events: none',
    'opacity: 0',
    'z-index: -1',
  ].join(';');

  const clone = canvasElement.cloneNode(true);
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.width = `${pageWidth}px`;
  clone.style.height = `${pageHeight}px`;
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await inlineQrCodesInElement(clone);
    await waitForImages(clone);

    const renderedCanvas = await html2canvas(clone, {
      scale: renderScale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    return {
      renderedCanvas,
      imgData: renderedCanvas.toDataURL('image/jpeg', 0.92),
      pageWidth,
      pageHeight,
    };
  } finally {
    sandbox.remove();
  }
};
