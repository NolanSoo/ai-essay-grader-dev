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
async function feedback(inputImagesMG, inputGradesMG, inputImagesSG, inputGradesSG, inputFeedbackMG, subgradePredictions, predictedGrade, imageInput, promptInput, rubricInput) {  
  console.log("Getting feedback...");  
  
  let message = "Hello. Please give professional feedback on images (1-2 sentences for overall and for every subgrade)...";  
  for (let i = 0; i < inputImagesMG.length; i++) {  
   message += `Image ${i + 1}: ${inputImagesMG[i]} - Main Grade: ${inputGradesMG[i]} - Feedback: ${inputFeedbackMG[i]}`;  
   for (const subgrade in inputImagesSG) {  
    message += `Subgrade ${subgrade}: ${inputImagesSG[subgrade][i]} - Grade: ${inputGradesSG[subgrade][i]}`;  
   }  
  }  
  if (rubricInput === "No rubric") {  
   // No rubric added (obviously)  
  } else {  
   message += `Here is the rubric given: ${rubricInput}`;  
  }  
  console.log(promptInput);  
  message += `Here is the prompt (if there is one, along with any other important directions): ${promptInput}`  
  console.log("message", message);  
  
  let message2 = `Here is the image I would like you to give feedback for: ${imageInput}. Its grade is ${predictedGrade.toFixed(1)}`;  
  for (const subgrade in subgradePredictions) {  
   message2 += `Grade for ${subgrade}: ${(subgradePredictions[subgrade]).toFixed(1)}`  
  }  
  message2 += `Make sure to list the final grade out of the maximum shown out of all images for each grade (both main and sub) before giving feedback for each section. After all subgrades, also give score out of 100 (based on the strictness of the other criteria) for conciseness, conventions, detail, and descriptions (also only give feedback on the image I just gave - all previous ones given by system were examples`  
  message2 += `Lastly, make sure to use this format: Overall Grade: {grade} + {feedback}, Subgrade {n}: {subgrade name} + {grade} + {feedback} (continue for all subgrades...) + Conciseness: {grade} + {feedback} + Conventions: {grade} + {feedback} + Detail: {grade} + {feedback} + Descriptions: {grade} + {feedback} - USING CORRECT HEADINGS IS ESPECIALLY IMPORTANT`  
  console.log("message2", message2);  
  const params = {  
   messages: [  
    {  
      role: "system",  
      content: message,  
    },  
    {  
      role: "user",  
      content: message2,  
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
   // Display the response in the output div  
   // Replace \n\n with <br> (newlines)  
   let formattedFeedback = messageContent.replace(/\n\n/g, '<br>');  
  
   // Replace ** with <strong> for bold text  
   formattedFeedback = formattedFeedback.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');  
   const lines = formattedFeedback.trim().split("\n");  
   const formattedFeedbackFinal = lines.map(line => line.trim() + "<br>").join("");  
  
   document.getElementById("output").innerHTML = formattedFeedbackFinal;  
  
   console.log("ID:", id);  
   console.log("Model:", model);  
   console.log("Created Timestamp:", created);  
   console.log("Message Content:", messageContent);  
   console.log("Prompt Tokens Used:", prompt_tokens);  
   console.log("Total Tokens Used:", total_tokens);  
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
  
export { feedback };
