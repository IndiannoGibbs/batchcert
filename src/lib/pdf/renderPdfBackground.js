import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

export { isPdfFile } from './pdfFileUtils.js';

export async function renderPdfFirstPageToDataUrl(
  file,
  { canvasSize = { width: 1100, height: 850 }, maxScale = 3 } = {}
) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  try {
    if (pdf.numPages < 1) {
      throw new Error('PDF has no pages');
    }

    const page = await pdf.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const scaleX = (canvasSize.width * 2) / baseViewport.width;
    const scaleY = (canvasSize.height * 2) / baseViewport.height;
    const scale = Math.min(scaleX, scaleY, maxScale);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Canvas is not supported in this browser');
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;

    return canvas.toDataURL('image/png');
  } finally {
    await pdf.destroy();
  }
}
