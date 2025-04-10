import { isGlyphs, renderGlyphString } from './glyphUtils.js';

let images = [];
let currentIndex = 0;
let logoCanvasContext = null;

export function getLogoCanvasContext() {
  if (!logoCanvasContext) {
    const canvas = document.getElementById("logo");
    logoCanvasContext = canvas.getContext('2d', { willReadFrequently: true });
  }
  return logoCanvasContext;
}

export function setImages(data) {
  images = data;
}

export function nextImage(cvInstance, setSelectedGlyphIndex) {
  currentIndex = (currentIndex + 1) % images.length;
  showImage(currentIndex, cvInstance, setSelectedGlyphIndex);
}

export function prevImage(cvInstance, setSelectedGlyphIndex) {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  showImage(currentIndex, cvInstance, setSelectedGlyphIndex);
}

export function showImage(index, cvInstance, setSelectedGlyphIndex) {
  const tempImg = new Image();
  tempImg.onload = function() {
    const glyphSheet = document.getElementById("glyph-sprite");
    isGlyphs(tempImg, glyphSheet, cvInstance)
      .then(glyphs => {
        renderGlyphString(glyphs, setSelectedGlyphIndex); // Pass setSelectedGlyphIndex here
        const logoCanvas = document.getElementById("logo");
        const dataUrl = logoCanvas.toDataURL("image/png");
        document.getElementById("background-layer").style.backgroundImage = `url('${dataUrl}')`;
        setBodyBgColor(logoCanvas);
      })
      .catch(err => console.error("Error processing glyphs:", err));
  };
  tempImg.src = images[index];
  console.log(tempImg.src);
}

// setBodyBgColor remains unchanged
export function setBodyBgColor(canvas) {
  const ctx = getLogoCanvasContext();
  const x = 765;
  const y = 165;
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const [r, g, b] = pixel;

  function lightenColor([r, g, b], percent) {
    r = Math.round(r + (255 - r) * (percent / 100));
    g = Math.round(g + (255 - g) * (percent / 100));
    b = Math.round(b + (255 - b) * (percent / 100));
    return [r, g, b];
  }
  const [lr, lg, lb] = lightenColor([r, g, b], 50);

  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.strokeStyle = `rgb(${lr}, ${lg}, ${lb})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  document.body.style.backgroundColor = `rgb(${lr}, ${lg}, ${lb})`;
}