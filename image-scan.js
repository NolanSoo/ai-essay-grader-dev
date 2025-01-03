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

// Function to scan image from a URL
async function scanImage(imageUrl) {
  try {
    // Make the API call to process the image URL
    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please process the image from this URL:"
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      model: "llama-3.2-11b-vision-preview",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null
    });

    // Log the response from Groq and return the result
    console.log(chatCompletion.choices[0].message.content);
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Error during image processing:", error);
    return 'Error during image processing';
  }
}


export { scanImage };
