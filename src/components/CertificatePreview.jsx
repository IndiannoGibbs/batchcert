import React from 'react';
import { PRESET_BACKGROUNDS } from '../constants/index.js';
import { deduplicateElements, getTextElementTransform } from '../lib/elements.js';
import {
  getElementDisplayText,
  getLineElementStyle,
  resolveFontFamily,
} from '../lib/certificateRender.js';
import QRCodeElement from './QRCodeElement.jsx';

export default function CertificatePreview({
  awardee,
  canvasSize,
  bgType,
  customBg,
  bgTransform,
  logoImg,
  globalData,
  elements,
  signatories,
  className = '',
}) {
  const previewElements = deduplicateElements(
    awardee?.hasCustomLayout && awardee.customElements ? awardee.customElements : elements
  );
  const previewSignatories = awardee?.hasCustomLayout && awardee.customSignatories
    ? awardee.customSignatories
    : signatories;

  const renderContext = {
    awardee: awardee || {},
    globalData: globalData || {},
    signatories: previewSignatories || [],
  };

  return (
    <div
      className={`relative overflow-hidden shadow-md ${className}`}
      style={{
        width: `${canvasSize.width}px`,
        height: `${canvasSize.height}px`,
        ...(bgType !== 'custom' ? PRESET_BACKGROUNDS[bgType]?.style : { backgroundColor: '#ffffff' }),
      }}
    >
      {bgType === 'custom' && customBg && (
        <img
          src={customBg}
          alt=""
          className="absolute pointer-events-none select-none"
          style={{
            width: `${bgTransform.width}%`,
            height: `${bgTransform.height}%`,
            left: `calc(50% + ${bgTransform.x}px)`,
            top: `calc(50% + ${bgTransform.y}px)`,
            transform: 'translate(-50%, -50%)',
            objectFit: 'fill',
            zIndex: 0,
          }}
        />
      )}

      {previewSignatories.map((sig) => {
        if (!sig.signatureImg) return null;
        const nameEl = previewElements.find((el) => el.sigId === sig.id && el.sigField === 'name');
        if (!nameEl || nameEl.visible === false) return null;

        return (
          <div
            key={`sig_img_${sig.id}`}
            className="absolute pointer-events-none select-none flex justify-center"
            style={{
              left: `${nameEl.x}%`,
              top: `${nameEl.y - 8}%`,
              transform: 'translateX(-50%)',
              zIndex: 9,
            }}
          >
            <img src={sig.signatureImg} alt="" className="max-h-16 object-contain" />
          </div>
        );
      })}

      {previewElements.map((el) => {
        if (el.visible === false) return null;

        return (
          <div
            key={el.id}
            className="absolute pointer-events-none select-none"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              transform: getTextElementTransform(el),
              width: el.type === 'text'
                ? `${el.maxWidth || 80}%`
                : (el.type === 'line' || el.type === 'logo' || el.type === 'image')
                  ? `${el.width || 100}px`
                  : el.type === 'qrcode'
                    ? `${el.size || 90}px`
                    : 'auto',
              zIndex: 10,
            }}
          >
            {el.type === 'text' ? (
              <div
                style={{
                  fontFamily: resolveFontFamily(el.font),
                  fontSize: `${el.fontSize}px`,
                  color: el.color,
                  textAlign: el.align || 'left',
                  fontWeight: el.bold ? 'bold' : 'normal',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.3,
                  display: 'block',
                  width: '100%',
                }}
                dangerouslySetInnerHTML={{ __html: getElementDisplayText(el, renderContext) }}
              />
            ) : el.type === 'line' ? (
              <div style={getLineElementStyle(el)} />
            ) : el.type === 'logo' && logoImg ? (
              <img src={logoImg} alt="" className="w-full h-auto object-contain pointer-events-none select-none" />
            ) : el.type === 'image' && el.src ? (
              <img src={el.src} alt="" className="w-full h-auto object-contain pointer-events-none select-none" />
            ) : el.type === 'qrcode' ? (
              <QRCodeElement
                text={getElementDisplayText(el, renderContext) || el.data || 'https://batchcert.verify'}
                size={el.size || 90}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
