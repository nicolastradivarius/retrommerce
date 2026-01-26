"use client";

import { useState } from "react";
import { Frame, Button, Cursor } from "@react95/core";
import { ArrowLeft, ArrowRight } from "@react95/icons";
import styles from "./ImageCarousel.module.css";

interface ImageCarouselProps {
  images: string[];
  productName: string;
}

export default function ImageCarousel({
  images,
  productName,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  if (!images || images.length === 0) {
    return (
      <Frame className={styles.carouselContainer}>
        <div className={styles.imagePlaceholder}>{productName}</div>
      </Frame>
    );
  }

  return (
    <Frame className={styles.carouselContainer}>
      <div className={styles.imageWrapper}>
        <div className={styles.imagePlaceholder}>{images[currentIndex]}</div>
      </div>

      {images.length > 1 && (
        <>
          <div className={styles.controls}>
            <Button
              onClick={goToPrevious}
              className={`${styles.navButton} ${Cursor.Pointer}`}
            >
              <ArrowLeft variant="32x32_4" />
            </Button>
            <span className={styles.indicator}>
              {currentIndex + 1} / {images.length}
            </span>
            <Button
              onClick={goToNext}
              className={`${styles.navButton} ${Cursor.Pointer}`}
            >
              <ArrowRight variant="32x32_4" />
            </Button>
          </div>

          <div className={styles.dots}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ""} ${Cursor.Pointer}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </Frame>
  );
}
