import { LabelConfig } from '../types';

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

export const stitchImages = async (beforeFile: File, afterFile: File): Promise<string> => {
  const [imgB, imgA] = await Promise.all([
    loadImage(URL.createObjectURL(beforeFile)),
    loadImage(URL.createObjectURL(afterFile)),
  ]);

  // Match Height Logic
  const h = Math.min(imgB.height, imgA.height);
  const wB = Math.floor(imgB.width * (h / imgB.height));
  const wA = Math.floor(imgA.width * (h / imgA.height));

  // Canvas Setup
  const sep = 15;
  const canvas = document.createElement('canvas');
  canvas.width = wB + wA + sep;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) throw new Error('Could not get canvas context');

  // Fill white background (for separator)
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Images
  // We need to draw them with high quality scaling if possible. 
  // Browser built-in scaling is generally decent for this.
  ctx.drawImage(imgB, 0, 0, wB, h);
  ctx.drawImage(imgA, wB + sep, 0, wA, h);

  // Font Setup (5% of Height)
  const fontSize = Math.floor(h * 0.05);
  // Using standard font string. "bold" matches the Python bold requirement.
  ctx.font = `bold ${fontSize}px Lato, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  const labels: LabelConfig[] = [
    { text: "BEFORE", imageX: 0, imageW: wB, align: "left" },
    { text: "AFTER", imageX: wB + sep, imageW: wA, align: "right" }
  ];

  labels.forEach((item) => {
    const text = item.text;
    const metrics = ctx.measureText(text);
    
    // Calculate dimensions
    // measureText gives actual bounding box, but we want a bit more robust height estimation
    // approximating height from font size is usually safer for vertical centering in canvas across browsers
    const textW = metrics.width;
    const textH = fontSize; // Approximate cap height + descender

    const padInnerX = textW * 0.4;
    const padInnerY = textH * 0.4;

    const boxW = textW + (padInnerX * 2);
    const boxH = textH + (padInnerY * 2);

    const marginX = Math.floor(item.imageW * 0.05);
    const marginY = Math.floor(h * 0.05);

    let boxX = 0;
    if (item.align === 'left') {
      boxX = item.imageX + marginX;
    } else {
      boxX = (item.imageX + item.imageW) - marginX - boxW;
    }

    const boxY = h - marginY - boxH;

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

  return canvas.toDataURL('image/jpeg', 0.95);
};
