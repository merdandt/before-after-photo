import { LabelConfig, ImageProcessingOptions, SocialFormat } from '../types';

// Palette from Python code
const PALETTE = {
  yellow: [255, 230, 0],
  red: [220, 20, 20],
  blue: [0, 100, 255],
  black: [20, 20, 20],
  white: [255, 255, 255],
};

// Helper to load image
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Helper to calculate Euclidean distance
const getDist = (c1: number[], c2: number[]) => {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
};

// Replicating get_best_contrast
const getBestContrast = (bgRgb: number[]) => {
  let maxDist = -1;
  let bestFill = PALETTE.black;

  Object.values(PALETTE).forEach((color) => {
    const dist = getDist(bgRgb, color);
    if (dist > maxDist) {
      maxDist = dist;
      bestFill = color;
    }
  });

  // Text Color Decision
  let textColor = '#ffffff';
  // Check if yellow or white (arrays need value comparison)
  const isYellow = bestFill[0] === 255 && bestFill[1] === 230 && bestFill[2] === 0;
  const isWhite = bestFill[0] === 255 && bestFill[1] === 255 && bestFill[2] === 255;

  if (isYellow || isWhite) {
    textColor = '#000000';
  }

  return {
    fill: `rgb(${bestFill[0]}, ${bestFill[1]}, ${bestFill[2]})`,
    text: textColor,
  };
};

// Get target dimensions for social media formats
const getTargetDimensions = (format: SocialFormat): { width: number; height: number } | null => {
  const formats = {
    'instagram-square': { width: 1080, height: 1080 },
    'instagram-story': { width: 1080, height: 1920 },
    'facebook-post': { width: 1200, height: 630 },
    'twitter-post': { width: 1200, height: 675 },
    'original': null,
  };
  return formats[format] || null;
};

export const stitchImages = async (
  beforeFile: File,
  afterFile: File,
  options: ImageProcessingOptions
): Promise<string> => {
  const [imgB, imgA] = await Promise.all([
    loadImage(URL.createObjectURL(beforeFile)),
    loadImage(URL.createObjectURL(afterFile)),
  ]);

  const sep = 15;
  let canvasWidth: number;
  let canvasHeight: number;
  let wB: number, hB: number, wA: number, hA: number;
  let xB: number, yB: number, xA: number, yA: number;

  if (options.orientation === 'vertical') {
    // Vertical Layout: Match Width
    const w = Math.min(imgB.width, imgA.width);
    wB = w;
    wA = w;
    hB = Math.floor(imgB.height * (w / imgB.width));
    hA = Math.floor(imgA.height * (w / imgA.width));

    canvasWidth = w;
    canvasHeight = hB + hA + sep;

    xB = 0;
    yB = 0;
    xA = 0;
    yA = hB + sep;
  } else {
    // Horizontal Layout: Match Height
    const h = Math.min(imgB.height, imgA.height);
    wB = Math.floor(imgB.width * (h / imgB.height));
    wA = Math.floor(imgA.width * (h / imgA.height));
    hB = h;
    hA = h;

    canvasWidth = wB + wA + sep;
    canvasHeight = h;

    xB = 0;
    yB = 0;
    xA = wB + sep;
    yA = 0;
  }

  // Canvas Setup
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) throw new Error('Could not get canvas context');

  // Fill white background (for separator)
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Images
  ctx.drawImage(imgB, xB, yB, wB, hB);
  ctx.drawImage(imgA, xA, yA, wA, hA);

  // Font Setup (5% of the relevant dimension)
  const fontSize = Math.floor((options.orientation === 'vertical' ? canvasWidth : canvasHeight) * 0.05);
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  const labels: LabelConfig[] =
    options.orientation === 'vertical'
      ? [
          { text: options.beforeLabel, imageX: xB, imageW: wB, align: 'left' },
          { text: options.afterLabel, imageX: xA, imageW: wA, align: 'left' },
        ]
      : [
          { text: options.beforeLabel, imageX: xB, imageW: wB, align: 'left' },
          { text: options.afterLabel, imageX: xA, imageW: wA, align: 'right' },
        ];

  labels.forEach((item, index) => {
    const text = item.text;
    const metrics = ctx.measureText(text);

    // Calculate dimensions
    const textW = metrics.width;
    const textH = fontSize;

    const padInnerX = textW * 0.4;
    const padInnerY = textH * 0.4;

    const boxW = textW + (padInnerX * 2);
    const boxH = textH + (padInnerY * 2);

    const marginX = Math.floor(item.imageW * 0.05);
    const marginY = Math.floor((options.orientation === 'vertical' ? (index === 0 ? hB : hA) : canvasHeight) * 0.05);

    let boxX = 0;
    if (item.align === 'left') {
      boxX = item.imageX + marginX;
    } else {
      boxX = (item.imageX + item.imageW) - marginX - boxW;
    }

    // For vertical layout, position labels at the bottom of each image section
    let boxY = 0;
    if (options.orientation === 'vertical') {
      if (index === 0) {
        boxY = hB - marginY - boxH; // Bottom of first image
      } else {
        boxY = hB + sep + hA - marginY - boxH; // Bottom of second image
      }
    } else {
      boxY = canvasHeight - marginY - boxH; // Bottom of canvas for horizontal
    }

    // Smart Color Logic
    // Get average color of the area where the box will be
    const imageData = ctx.getImageData(boxX, boxY, boxW, boxH);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    const count = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    const avgBg = [Math.floor(r / count), Math.floor(g / count), Math.floor(b / count)];
    const colors = getBestContrast(avgBg);

    // Draw Rounded Box
    ctx.fillStyle = colors.fill;
    
    // Round rect support check or fallback
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, boxH * 0.5);
      ctx.fill();
    } else {
      // Fallback for older browsers (though unlikely needed in modern React apps)
      const r = boxH * 0.5;
      ctx.beginPath();
      ctx.moveTo(boxX + r, boxY);
      ctx.lineTo(boxX + boxW - r, boxY);
      ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
      ctx.lineTo(boxX + boxW, boxY + boxH - r);
      ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH);
      ctx.lineTo(boxX + r, boxY + boxH);
      ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
      ctx.lineTo(boxX, boxY + r);
      ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
      ctx.closePath();
      ctx.fill();
    }

    // Draw Text
    ctx.fillStyle = colors.text;
    const centerX = boxX + (boxW / 2);
    const centerY = boxY + (boxH / 2);
    // Slight vertical adjustment because 'middle' baseline can vary slightly by font
    ctx.fillText(text, centerX, centerY + (fontSize * 0.05));
  });

  // Apply social media format if specified
  if (options.targetFormat && options.targetFormat !== 'original') {
    const targetDims = getTargetDimensions(options.targetFormat);
    if (targetDims) {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetDims.width;
      finalCanvas.height = targetDims.height;
      const finalCtx = finalCanvas.getContext('2d');

      if (!finalCtx) throw new Error('Could not get final canvas context');

      // Fill with white background
      finalCtx.fillStyle = 'white';
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Calculate scaling to fit comparison image
      const scale = Math.min(
        targetDims.width / canvas.width,
        targetDims.height / canvas.height
      );

      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;

      // Center the image
      const x = (targetDims.width - scaledWidth) / 2;
      const y = (targetDims.height - scaledHeight) / 2;

      finalCtx.drawImage(canvas, x, y, scaledWidth, scaledHeight);

      return finalCanvas.toDataURL('image/jpeg', 0.95);
    }
  }

  return canvas.toDataURL('image/jpeg', 0.95);
};
