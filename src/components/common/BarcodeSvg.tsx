'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeSvgProps {
  value: string;
  format?: 'CODE128' | 'EAN13' | 'pharmacode';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  textMargin?: number;
  lineColor?: string;
  className?: string;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  format = 'CODE128',
  width = 1.6,
  height = 42,
  displayValue = true,
  fontSize = 11,
  textMargin = 2,
  lineColor = '#000000',
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          font: 'monospace',
          fontSize,
          textMargin,
          lineColor,
          margin: 0,
        });
      } catch (err) {
        console.warn('Barcode generation warning:', err);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, textMargin, lineColor]);

  return <svg ref={svgRef} className={`barcode-svg ${className}`} />;
};
