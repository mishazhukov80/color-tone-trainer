import React, { useState } from "react";
import './App.css';
var tinycolor = require("tinycolor2");


// Helper function to generate random color
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const getClosestColorByLuminance = (referenceColor, numColors = 10) => {
  const randomColors = Array.from({ length: numColors }, getRandomColor);
  let closestColor = randomColors[0];
  let smallestDifference = Math.abs(getLuminance(referenceColor) - getLuminance(closestColor));

  randomColors.forEach((color) => {
    const difference = Math.abs(getLuminance(referenceColor) - getLuminance(color));
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestColor = color;
    }
  });

  return closestColor;
};


// Helper function to calculate the relative luminance of a color
const getLuminance = (hex) => {
  return rgbToGrayscaleGammaCorrected( tinycolor(hex).toRgb() ) / 255;
};

// Convert a color to its grayscale equivalent using luminance
const convertToLuminanceGrayscale = (hex) => {
  const luminance = getLuminance(hex);
  const grayscaleValue = Math.round(luminance * 255);
  const grayscaleHex = `#${grayscaleValue.toString(16).padStart(2, "0").repeat(3)}`;
  return grayscaleHex;
};

const App = () => {
  const [color1, setColor1] = useState(getRandomColor());
  const [color2, setColor2] = useState(getRandomColor());
  const [result, setResult] = useState("");
  const [showLuminance, setShowLuminance] = useState(false); // State for luminance mode
  const [correctGuesses, setCorrectGuesses] = useState(0); // Number of correct guesses
  const [totalAttempts, setTotalAttempts] = useState(0);   // Total number of attempts
  const [difficulty, setDifficulty] = useState("medium"); // State for difficulty level
  const [colorSelected, setColorSelected] = useState(false); // State to track if a color is selected
  const [backgroundColor, setBackgroundColor] = useState("#ffffff"); // State for background color

  // Calculate percentage of correct answers
  const calculateScore = () => {
    return totalAttempts === 0 ? 0 : ((correctGuesses / totalAttempts) * 100).toFixed(2);
  };

  const handleColorClick = (color) => {
    if (colorSelected) return; // Prevent further clicks if a color has already been clicked

    const luminance1 = getLuminance(color1);
    const luminance2 = getLuminance(color2);

    setTotalAttempts((prev) => prev + 1); // Increment total attempts

    if ( Math.abs(luminance1-luminance2) <= 0.01 ) {
      setResult("Correct! Both colors have same or very similar tones.");
      setCorrectGuesses((prev) => prev + 1); // Increment correct guesses
    } else if ((color === color1 && luminance1 < luminance2) || (color === color2 && luminance2 < luminance1)) {
      setResult("Correct! You picked the darker color.");
      setCorrectGuesses((prev) => prev + 1); // Increment correct guesses
    } else {
      setResult("Wrong! You picked the lighter color.");
    }

    setShowLuminance(true); // Reveal hint
    setColorSelected(true); // Set color selected to true
  };

  const handleReset = () => {
    let newColor1 = getRandomColor();
    let newColor2;
  
    if (difficulty === 'easy') {
      newColor2 = getClosestColorByLuminance(newColor1, 2);
    } else if (difficulty === 'medium') {
      newColor2 = getClosestColorByLuminance(newColor1, 7); // Medium difficulty: closer color
    } else if (difficulty === 'hard') {
      newColor2 = getClosestColorByLuminance(newColor1, 14); // Hard difficulty: very close color
    }
  
    setColor1(newColor1);
    setColor2(newColor2);
    setResult("");
    setShowLuminance(false);
    setColorSelected(false);
  };

  const handleHint = () => {
    setShowLuminance(true); // Show luminance-based grayscale swatches
  };

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
    handleReset();
  };

  const handleBackgroundColorChange = (event) => {
    setBackgroundColor(event.target.value);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px", marginBottom: "30px"}}>
      {/* Display Score */}
      <div style={{ marginTop: "0px" }}>
        <div style={{ fontWeight: "bold" }}>Score: {calculateScore()}% ({correctGuesses} / {totalAttempts})</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" }}>
          <div>
            <label htmlFor="difficulty">Difficulty: </label>
            <select id="difficulty" value={difficulty} onChange={handleDifficultyChange}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label htmlFor="background-color">Background: </label>
            <input
              type="color"
              id="background-color"
              value={backgroundColor}
              onChange={handleBackgroundColorChange}
            />
          </div>
        </div>
      </div>


      {result==="" && <div style={{ marginTop: "20px", marginBottom: "5px", display: "flex", justifyContent: "center", alignItems: "center"}}>
        <div style={{fontWeight: "bold"}}>Select darker color:</div>
        {!showLuminance && <button onClick={handleHint} className="clickable-text">Hint</button>}
      </div>}
      {result!=="" && <div style={{ marginTop: "20px", marginBottom: "5px", display: "flex", justifyContent: "center", alignItems: "center"}}>
        <div style={{fontWeight: "bold", color: result.includes("Correct") ? "green" : "red"}}>{result}</div>
        <button onClick={handleReset} className="clickable-text">Next Pair</button>
      </div>}

      {/* Original Color Swatches */}
      <div style={{display: "flex", justifyContent: "center", }}>
        <div style={{backgroundColor: backgroundColor, padding: backgroundColor !== '' ? "100px" : "0px"}}>
          <div style={{ display: "flex", justifyContent: "center", gap: "0px" }}>
            <div
              onClick={() => handleColorClick(color1)}
              style={{
                width: "150px",
                height: "150px",
                backgroundColor: color1,
                cursor: "pointer",
                border: "0px solid #000",
              }}
            ></div>
            <div
              onClick={() => handleColorClick(color2)}
              style={{
                width: "150px",
                height: "150px",
                backgroundColor: color2,
                cursor: "pointer",
                border: "0px solid #000",
              }}
            ></div>
          </div>

          {/* Luminance-based Grayscale Swatches and Luminance Values */}
          {showLuminance && (
            <div style={{ marginTop: "0px" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: "0px" }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "150px",
                      height: "150px",
                      backgroundColor: convertToLuminanceGrayscale(color1),
                      border: "0px solid #000",
                    }}
                  ></div>
                  <p style={{"font-size": "50%", color: "gray"}}>{color1} Y:{getLuminance(color1).toFixed(3)}</p>
                  </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "150px",
                      height: "150px",
                      backgroundColor: convertToLuminanceGrayscale(color2),
                      border: "0px solid #000",
                    }}
                  ></div>
                  <p style={{"font-size": "50%", color: "gray"}}>{color2} Y:{getLuminance(color2).toFixed(3)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


function gammaCorrect(value) {
  return (value / 255) <= 0.04045 ? (value / 255) / 12.92 : Math.pow(((value / 255) + 0.055) / 1.055, 2.4);
}

function inverseGammaCorrect(value) {
  return (value <= 0.0031308) ? (value * 12.92) * 255 : (1.055 * Math.pow(value, 1 / 2.4) - 0.055) * 255;
}

function rgbToGrayscaleGammaCorrected(rgb255) {
  // Step 1: Gamma-correct each channel (R, G, B)
  const rLin = gammaCorrect(rgb255.r);
  const gLin = gammaCorrect(rgb255.g);
  const bLin = gammaCorrect(rgb255.b);

  // Step 2: Calculate the luminance in linear light
  const linearLuminance = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;

  // Step 3: Convert the linear luminance back to gamma-encoded space
  const grayscale = inverseGammaCorrect(linearLuminance);

  // Step 4: Round and return the grayscale value
  const grayscaleValue = Math.round(grayscale);

  return grayscaleValue
}

export default App;
