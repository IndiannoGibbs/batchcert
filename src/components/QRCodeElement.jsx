import React, { useEffect, useState } from 'react';
import { generateQrDataUrl } from '../lib/qr/qrCache.js';

export default function QRCodeElement({ text, size = 90 }) {
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState(false);
  const displayText = text || 'https://batchcert.verify';

  useEffect(() => {
    let cancelled = false;
    setError(false);

    generateQrDataUrl(displayText, size)
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl('');
          setError(true);
        }
      });

    return () => { cancelled = true; };
  }, [displayText, size]);

  return (
    <div
      data-qr-code
      data-qr-text={displayText}
      data-qr-size={size}
      className="bg-white p-1.5 rounded shadow-md flex items-center justify-center border border-purple-100"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="QR Code"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      ) : (
        <div
          className={`w-full h-full rounded flex items-center justify-center text-[9px] font-semibold ${error ? 'bg-red-50 text-red-600' : 'bg-purple-50 animate-pulse text-purple-400'}`}
          title={error ? 'QR generation failed' : 'Generating QR code…'}
        >
          {error ? 'QR' : ''}
        </div>
      )}
    </div>
  );
}
