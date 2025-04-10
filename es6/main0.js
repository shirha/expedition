import { waitForOpenCV, isGlyphs, renderGlyphString, updateGlyphString, setupGlyphSpriteClick } from './glyphUtils.js';
import { getLogoCanvasContext, setImages, nextImage, prevImage, showImage, setBodyBgColor } from './imageNavigation.js';

let cvInstanceGlobal;
let selectedGlyphIndex = null;
const setSelectedGlyphIndex = index => {
  selectedGlyphIndex = index;
  console.log("Selected glyph index set to:", selectedGlyphIndex);
};

function onOpenCVLoaded() {
  console.log("opencv.js loaded");

  waitForOpenCV()
    .then(cvInstance => {
      cvInstanceGlobal = cvInstance;
      console.log("OpenCV ready for paste events");
      getLogoCanvasContext();
      setupGlyphSpriteClick(() => selectedGlyphIndex, setSelectedGlyphIndex);
    })
    .catch(err => console.error("Error initializing OpenCV:", err));

  document.onpaste = function(event) {
    const item = event.clipboardData.items[0];
    if (item.type.indexOf("image") === 0) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const tempImg = new Image();
        tempImg.onload = function() {
          const glyphSheet = document.getElementById("glyph-sprite");
          isGlyphs(tempImg, glyphSheet, cvInstanceGlobal)
            .then(glyphs => {
              renderGlyphString(glyphs, setSelectedGlyphIndex);
              const logoCanvas = document.getElementById("logo");
              const dataUrl = logoCanvas.toDataURL("image/png");
              document.getElementById("background-layer").style.backgroundImage = `url('${dataUrl}')`;
              setBodyBgColor(logoCanvas);
            })
            .catch(err => console.error("Error processing glyphs:", err));
        };
        tempImg.src = e.target.result;
      };
      reader.readAsDataURL(item.getAsFile());
    }
  };

  fetch('glyph_filename.json')
    .then(response => response.json())
    .then(data => {
      setImages(data);
      showImage(0, cvInstanceGlobal, setSelectedGlyphIndex); // Pass setSelectedGlyphIndex here
    })
    .catch(error => {
      console.error('Error loading JSON data:', error);
    });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
      nextImage(cvInstanceGlobal, setSelectedGlyphIndex); // Pass setSelectedGlyphIndex
    } else if (event.key === 'ArrowLeft') {
      prevImage(cvInstanceGlobal, setSelectedGlyphIndex); // Pass setSelectedGlyphIndex
    }
  });
}

export { onOpenCVLoaded };