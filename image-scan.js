// Import the Tesseract.js library  
import Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js';  
  
// Function to scan an image  
async function scanImage(imageData) {  
  try {  
    // Recognize text from the image using Tesseract.js
    const { data: { text } } = await Tesseract.recognize(  
      imageData, // Image source (URL, file, or canvas)
      'eng',     // Language for OCR
      {  
        logger: m => console.log(m) // Logs progress (optional)
      }  
    );  
    return text; // Return the recognized text  
  } catch (error) {  
    console.error('Error during image scanning:', error);  
    return ''; // Return empty string in case of an error  
  }  
}  
  
// Export the scanImage function for external use
export { scanImage };  
