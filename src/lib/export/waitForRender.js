import { inlineQrCodesInElement, waitForImages } from '../qr/qrCache.js';

export const waitForCanvasRender = () =>
  new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 80))));

export const prepareCanvasForCapture = async (canvasElement) => {
  if (!canvasElement) return;

  await waitForCanvasRender();
  await inlineQrCodesInElement(canvasElement);
  await waitForImages(canvasElement);
};
