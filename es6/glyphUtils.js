export async function waitForOpenCV() {
  console.log("Checking for OpenCV...");
  const cvInstance = await cv; // Assuming `cv` is globally available from opencv.js
  console.log("OpenCV initialized with properties:", Object.keys(cvInstance).length);
  return cvInstance;
}

export async function isGlyphs(tempImage, glyphSprite, cvInstance) {
  try {
    let mat = cvInstance.imread(tempImage);
    if (mat.empty()) throw new Error("Failed to load source image");

    // Crop bottom-left quarter (color) for logo canvas
    const logoWidth = 960;
    const logoHeight = 540;
    const logoX = 0;
    const logoY = mat.rows - logoHeight;
    let logoMat = mat.roi(new cvInstance.Rect(logoX, logoY, logoWidth, logoHeight));
    const logoCanvas = document.getElementById("logo");
    logoCanvas.width = logoMat.cols;
    logoCanvas.height = logoMat.rows;
    cvInstance.imshow(logoCanvas, logoMat);

    // Glyph detection (grayscale)
    let gray = new cvInstance.Mat();
    cvInstance.cvtColor(mat, gray, cvInstance.COLOR_RGBA2GRAY);
    let cropped = gray.roi(new cvInstance.Rect(11, 1015, 384, 32));
    let glyphMat = cvInstance.imread(glyphSprite);
    if (glyphMat.empty()) throw new Error("Failed to load glyph sprite");
    cvInstance.cvtColor(glyphMat, glyphMat, cvInstance.COLOR_RGBA2GRAY);

    let glyphs = "", matchScore = 0;
    let result = new cvInstance.Mat();

    for (let i = 0; i < 12; i++) {
      let roi = cropped.roi(new cvInstance.Rect(i * 32, 0, 32, 32));
      cvInstance.matchTemplate(roi, glyphMat, result, cvInstance.TM_SQDIFF_NORMED);
      
      // Sample every 32nd value from result
      let sampledResult = [];
      for (let x = 0; x < 512; x += 32) {
        let value = result.data32F[x];
        sampledResult.push(value);
      }
      
      // Find min value and index (like np.min and np.argmin)
      let minValue = Math.min(...sampledResult);
      let minIndex = sampledResult.indexOf(minValue);
      matchScore += minValue;
      glyphs += "0123456789abcdef"[minIndex];
      
      // Log it
      console.log(`${minIndex.toString().padStart(2)} [${sampledResult.map(v => v.toFixed(3)).join(", ")}]`);
      roi.delete();
    }

    // Clean up
    logoMat.delete();
    gray.delete();
    cropped.delete();
    glyphMat.delete();
    result.delete();
    mat.delete();

    console.log(`Glyphs: mn+:${matchScore.toFixed(3)} ${glyphs}`);
    return glyphs;
  } catch (error) {
    console.error("Error in isGlyphs:", error);
    throw error;
  }
}

export function renderGlyphString(glyphs, setSelectedGlyphIndex) {
  const glyphStringDiv = document.getElementById("glyph-string");
  glyphStringDiv.innerHTML = "";
  for (let i = 0; i < glyphs.length; i++) {
    const span = document.createElement("span");
    span.textContent = glyphs[i];
    span.dataset.index = i;
    span.addEventListener("click", function() {
      if (this.classList.contains("selected")) {
        this.classList.remove("selected");
        setSelectedGlyphIndex(null); // Callback to update main.js state
      } else {
        document.querySelectorAll("#glyph-string span").forEach(s => s.classList.remove("selected"));
        this.classList.add("selected");
        setSelectedGlyphIndex(parseInt(this.dataset.index));
      }
    });
    glyphStringDiv.appendChild(span);
  }
  document.getElementById("decoder").href = `https://nmsportals.github.io/#${glyphs}`;
}

export function setupGlyphSpriteClick(getSelectedGlyphIndex, setSelectedGlyphIndex) {
  const glyphSprite = document.getElementById("glyph-sprite");
  glyphSprite.addEventListener("click", function(event) {
    const selectedGlyphIndex = getSelectedGlyphIndex();
    console.log("Glyph sprite clicked, selectedGlyphIndex:", selectedGlyphIndex);
    if (selectedGlyphIndex === null) return;
    const rect = glyphSprite.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const glyphWidth = glyphSprite.width / 16;
    const glyphIndex = Math.floor(x / glyphWidth);
    const newGlyph = "0123456789abcdef"[glyphIndex];
    console.log("Updating glyph at index", selectedGlyphIndex, "to", newGlyph);
    updateGlyphString(selectedGlyphIndex, newGlyph, setSelectedGlyphIndex);
  });
}

export function updateGlyphString(index, newGlyph, setSelectedGlyphIndex) {
  const spans = document.querySelectorAll("#glyph-string span");
  spans[index].textContent = newGlyph;
  spans[index].classList.remove("selected");
  const glyphs = Array.from(spans).map(span => span.textContent).join("");
  document.getElementById("decoder").href = `https://nmsportals.github.io/#${glyphs}`;
  setSelectedGlyphIndex(null); // Reset selection state
  return glyphs; // Return updated string for convenience
}