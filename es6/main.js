import { waitForOpenCV, isGlyphs, renderGlyphString, updateGlyphString, setupGlyphSpriteClick } from './glyphUtils.js';
import { getLogoCanvasContext, setImages, nextImage, prevImage, showImage, setBodyBgColor } from './imageNavigation.js';

let cvInstanceGlobal;
let selectedGlyphIndex = null;
const setSelectedGlyphIndex = index => {
  selectedGlyphIndex = index;
  console.log("Selected glyph index set to:", selectedGlyphIndex);
};
const getSelectedGlyphIndex = () => selectedGlyphIndex;

function processImage(imageDataUrl) {
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
  tempImg.src = imageDataUrl;
}

function onOpenCVLoaded() {
  console.log("opencv.js loaded");

  waitForOpenCV()
    .then(cvInstance => {
      cvInstanceGlobal = cvInstance;
      console.log("OpenCV ready for paste and drop events");
      getLogoCanvasContext();
      setupGlyphSpriteClick(getSelectedGlyphIndex, setSelectedGlyphIndex);
    })
    .catch(err => console.error("Error initializing OpenCV:", err));

  // Paste handler
  document.onpaste = function(event) {
    const item = event.clipboardData.items[0];
    if (item.type.indexOf("image") === 0) {
      const reader = new FileReader();
      reader.onload = function(e) {
        processImage(e.target.result);
      };
      reader.readAsDataURL(item.getAsFile());
    }
  };

  // Drag-and-drop handler
  const dropZone = document.getElementById("container");
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault(); // Allow drop
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function(e) {
        processImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.error("Dropped file is not an image");
    }
  });

  // Existing fetch and keydown logic
  fetch('glyph_filename_i.json')
    .then(response => response.json())
    .then(data => {
      setImages(data);
      showImage(0, cvInstanceGlobal, setSelectedGlyphIndex);
    })
    .catch(error => {
      console.error('Error loading JSON data:', error);
    });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
      nextImage(cvInstanceGlobal, setSelectedGlyphIndex);
    } else if (event.key === 'ArrowLeft') {
      prevImage(cvInstanceGlobal, setSelectedGlyphIndex);
    }
  });
}

export { onOpenCVLoaded };