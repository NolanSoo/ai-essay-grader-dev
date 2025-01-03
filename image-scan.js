// Import the Tesseract.js library  
import Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js';  

// Function to scan an image using Tesseract.js
async function scanImage(imageData) {  
  try {  
    // Recognize text from the image using Tesseract.js
    const { data: { text, words, confidence } } = await Tesseract.recognize(  
      imageData, // Image source (URL, file, or canvas)
      'eng',     // Language for OCR
      {  
        logger: m => console.log(m) // Logs progress (optional)
      }  
    );  

    // Log the recognized text and confidence levels
    console.log("Recognized text:", text);
    console.log("Overall confidence:", confidence);

    // Log confidence for each word
    words.forEach(word => {
      console.log(`Word: "${word.text}" - Confidence: ${word.confidence}`);
    });

    return text; // Return the recognized text  
  } catch (error) {  
    console.error('Error during image scanning:', error);  
    return ''; // Return empty string in case of an error  
  }  
}

export { scanImage };


export { scanImage };
