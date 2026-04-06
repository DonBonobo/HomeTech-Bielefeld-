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

  return (
    <>
      <div className="media-card media-card--stage">
        <div className="media-stage-glow" />
        <button type="button" className="gallery-stage-button" onClick={() => setZoomed(true)} aria-label="Produktbild vergrößern">
          <Image src={activeImage} alt={title} width={720} height={720} />
        </button>
        <div className="pdp-thumb-row">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`pdp-thumb ${index === activeIndex ? "is-active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Bild ${index + 1} anzeigen`}
            >
              <Image src={image} alt="" width={120} height={120} />
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
            <Image src={activeImage} alt={title} width={1200} height={1200} className="gallery-zoom-image" />
          </div>
        </div>
      ) : null}
    </>
  );
}
