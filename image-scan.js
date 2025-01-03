// // Import the Tesseract.js library  
// import Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js';  
  
// // Function to scan an image  
// async function scanImage(imageData) {  
//   try {  
//     // Recognize text from the image using Tesseract.js
//     const { data: { text } } = await Tesseract.recognize(  
//       imageData, // Image source (URL, file, or canvas)
//       'eng',     // Language for OCR
//       {  
//         logger: m => console.log(m) // Logs progress (optional)
//       }  
//     );  
//     return text; // Return the recognized text  
//   } catch (error) {  
//     console.error('Error during image scanning:', error);  
//     return ''; // Return empty string in case of an error  
//   }  
// }  tesseract underperformed
   
// Import the Groq SDK
import Groq from "https://cdn.jsdelivr.net/npm/groq-sdk@0.8.0/+esm";

const encodedApiKey = "Z3NrX21tTzZvWlpXMjdQbkJqTnpyWFVHV0dkeWIzRllsT0Z5TzVBYUtSbldQUGdubkZ5T1hKY2M="; // Fake key
const decodedApiKey = atob(encodedApiKey);

// Initialize the Groq client
const client = new Groq({
  apiKey: decodedApiKey,
  dangerouslyAllowBrowser: true,
});

// Function to convert an image file to a data URL
function convertImageToDataURL(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // Resolves with data URL
    reader.onerror = (error) => reject(error); // Reject on error
    reader.readAsDataURL(imageFile); // Read the file as a data URL
  });
}

// Function to get feedback from Groq (scan the image)
async function scanImage(inputImage) {
  try {
    // Convert the image file to a data URL
    const imageDataUrl = await convertImageToDataURL(inputImage);
    console.log("Image Data URL: ", imageDataUrl); // Log the image URL

    // Construct the message for Groq
    const message = `Read this - and explain the methodology of how the link was generated for you to read the image`;

    const params = {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: message, // Text asking to explain the methodology
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl, // Include the base64 image URL
              },
            },
          ],
        },
      ],
      model: "llama3-8b-8192", // Groq model
    };

    // Make the API call to Groq
    const chatCompletion = await client.chat.completions.create(params);
    const messageContent = chatCompletion.choices[0].message.content;

    console.log("Groq Response: ", messageContent); // Log the response from Groq
    return messageContent; // Return the feedback or result from Groq

  } catch (error) {
    console.error("Error during image processing with Groq:", error);
    return ''; // Return empty string in case of an error
  }
}


// Helper function to pause execution for a given time (in milliseconds)
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

export { scanImage };
