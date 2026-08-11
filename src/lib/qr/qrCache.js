import QRCode from 'qrcode';

const cache = new Map();

export const getQrCacheKey = (text, size) => `${String(text || '').trim()}|${Math.round(size)}`;

export const generateQrDataUrl = async (text, size = 90) => {
  const value = String(text || '').trim() || 'https://batchcert.verify';
  const key = getQrCacheKey(value, size);

  if (cache.has(key)) {
    return cache.get(key);
  }

  const renderSize = Math.max(Math.round(size * 4), 256);
  const url = await QRCode.toDataURL(value, {
    width: renderSize,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#1f2937', light: '#ffffff' },
  });

  cache.set(key, url);
  return url;
};

export const clearQrCache = () => cache.clear();

export const waitForImages = (root, timeoutMs = 4000) =>
  new Promise((resolve) => {
    if (!root) {
      resolve(false);
      return;
    }

    const start = Date.now();
    const check = () => {
      const imgs = [...root.querySelectorAll('img')];
      const ready = imgs.length === 0 || imgs.every(img => img.complete && img.naturalWidth > 0);
      if (ready) {
        resolve(true);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(false);
        return;
      }
      setTimeout(check, 40);
    };
    check();
  });

export const inlineQrCodesInElement = async (root) => {
  if (!root) return;

  const qrNodes = root.querySelectorAll('[data-qr-code]');
  await Promise.all([...qrNodes].map(async (node) => {
    const text = node.getAttribute('data-qr-text') || '';
    const size = Number(node.getAttribute('data-qr-size') || 90);
    const url = await generateQrDataUrl(text, size);

    let img = node.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = 'QR Code';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.style.pointerEvents = 'none';
      node.innerHTML = '';
      node.appendChild(img);
    }
    img.src = url;
  }));

  await waitForImages(root);
};
