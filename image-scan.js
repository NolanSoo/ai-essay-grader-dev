// Import the Tesseract.js library  
import Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract-js@0.0.1/+esm';  
  
// Function to scan an image  
async function scanImage(imageData) {  
  try {  
   const scannedText = await Tesseract.recognize(  
    imageData,  
    'eng',  
    {  
      logger: m => console.log(m)  
    }  
   ).then(({ data: { text } }) => {  
    return text;  
   });  
   return scannedText;  
  } catch (error) {  
   console.error(error);  
   return '';  
  }  
}  
  
export { scanImage };
