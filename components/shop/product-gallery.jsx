"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export function ProductGallery({ title, gallery }) {
  const images = useMemo(() => (Array.isArray(gallery) && gallery.length ? gallery : []), [gallery]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!images.length) {
    return null;
  }

  const activeImage = images[activeIndex] || images[0];
  const activeImageSrc = typeof activeImage === "string" ? activeImage : activeImage?.src;
  const activeImageAlt = typeof activeImage === "string" ? title : (activeImage?.alt || title);

  return (
    <>
      <div className="media-card media-card--stage">
        <div className="media-stage-glow" />
        <button type="button" className="gallery-stage-button" onClick={() => setZoomed(true)} aria-label="Produktbild vergrößern">
          <Image src={activeImageSrc} alt={activeImageAlt} width={720} height={720} />
        </button>
        <div className="pdp-thumb-row">
          {images.map((image, index) => (
            <button
              key={`${typeof image === "string" ? image : image?.src}-${index}`}
              type="button"
              className={`pdp-thumb ${index === activeIndex ? "is-active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Bild ${index + 1} anzeigen`}
            >
              <Image src={typeof image === "string" ? image : image?.src} alt="" width={120} height={120} />
            </button>
          ))}
        </div>
      </div>

      {zoomed ? (
        <div className="gallery-zoom-overlay" role="dialog" aria-modal="true">
          <button type="button" className="gallery-zoom-backdrop" onClick={() => setZoomed(false)} aria-label="Zoom schließen" />
          <div className="gallery-zoom-card">
            <button type="button" className="gallery-zoom-close" onClick={() => setZoomed(false)}>
              Schließen
            </button>
            <Image src={activeImageSrc} alt={activeImageAlt} width={1200} height={1200} className="gallery-zoom-image" />
          </div>
        </div>
      ) : null}
    </>
  );
}
