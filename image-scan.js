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

const encodedApiKey = "Z3NrX21tTzZvWlpXMjdQbkJqTnpyWFVHV0dkeWIzRllsT0Z5TzVBYUtSbldQUGdubkZ5T1hKY2M=";
// this is a fake key btw
const decodedApiKey = atob(encodedApiKey);

// Keep decodedApiKey hidden and use it in your API request logic
// Initialize the Groq client
const client = new Groq({
apiKey: decodedApiKey,
dangerouslyAllowBrowser: true,
});

// Function to get feedback from the model
async function scanImage(inputImage) {
console.log("Getting feedback...");

let message = `Hello. Please scan the text here in ${inputImage} - and output the exact text`;
console.log("message", message);
const params = {
messages: [
{
role: "system",
content: message,
},
],
model: "llama3-8b-8192",
};

try {
// Make the API call
const chatCompletion = await client.chat.completions.create(params);
console.log(chatCompletion);

// Extract the main fields
const { id, model, created, choices, usage } = chatCompletion;
const messageContent = choices[0].message.content;
const { prompt_tokens, total_tokens } = usage;

console.log("ID:", id);
console.log("Model:", model);
console.log("Created Timestamp:", created);
console.log("Message Content:", messageContent);
console.log("Prompt Tokens Used:", prompt_tokens);
console.log("Total Tokens Used:", total_tokens);
return messageContent;
} catch (err) {
if (err instanceof Groq.APIError) {
console.error("API Error:", err);
document.getElementById("output").textContent = `Error: ${err.name} (${err.status})`;
} else {
console.error("Unexpected Error:", err);
document.getElementById("output").textContent = "An unexpected error occurred.";
}
}
}

// Helper function to pause execution for a given time (in milliseconds)
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

export { scanImage };
