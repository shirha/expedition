pip3.py walks directories named by a single digit like '0' and '1' and calls a list of functions with a screenshot image until it returns True. This process creates a pip0.json output file used by pipj.py to create the web page. 

The functions are in the pip3m.py import and their names are:

**isSysInfo()**

This screenshot opportunity is created when you enter the space station through the teleporter. The screen is identified by the double slashes // in the bottom left corner. OpenCV is used to capture the following information. It's extremely important that this information has a dark background so that the OCR can read it.

System Info
 Celestial Bodies: 5 Planets
 Dominant Lifeform: Korvax
 Economy: Construction // Flourishing
 Conflict level: Stable

**isVisited()**

This screenshot is identified by 'VISITED SYSTEMS' in the upper left of the screen. It's important to note that there are 3 different screens identified here. 

1. SetSysten screen with no visible system or planet 'card'.

This is used to set the System name prior to a batch of Resources and Biomes for that System.

2. Biome screen with cursor over the plant on the left side of the screen showing the Biome in a planet 'card'.

3. Sysinfo screen with the cursor over the system on the left side of the screen showing the SysInfo in a system 'card'
This is good alternative to get SysInfo in a system without a space station.

**isGlyphs()**

This screenshot MUST follow the SysInfo screenshot to get captured.

Glyphs: 106202 900054

The NMS-Glyphs-Mono.ttf is used to display these hex digits correctly.

**isTechno()**

The screenshots here are either of the Galactic Terminal or Technology Merchants.

**isResource()**

These screenshots capture planet info and planet resources

**isStellar()**

This screenshot is found in the missions 'Log' tab and selecting the Exploration Guide.
This captures the "Stellar Classification" for the system color.
Note: Yellow is F or G, Red is K or M, Green is E, Blue is B or O 

The Python libraries needed are:

import imutils
import cv2 # OpenCV
import numpy as np
import pytesseract

Checkout the Demo.pdf and visit Github Pages site for this project.
