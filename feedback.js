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
async function feedback(inputEssaysMG, inputGradesMG, inputEssaysSG, inputGradesSG, inputFeedbackMG, subgradePredictions, predictedGrade, essayInput, promptInput, rubricInput) {  
  console.log("Getting feedback...");  
  
  let message = "Hello. Please give professional feedback on essays (1-2 sentences for overall and for every subgrade)...";  
  for (let i = 0; i < inputEssaysMG.length; i++) {  
   message += `Essay ${(i + 1)}: ${inputEssaysMG[i]} - Main Grade: ${inputGradesMG[i]} - Feedback: ${inputFeedbackMG[i]}`;  
   for (const subgrade in inputEssaysSG) {  
    message += `Subgrade ${subgrade}: ${inputEssaysSG[subgrade][i]} - Grade: ${inputGradesSG[subgrade][i]}`;  
   }  
  }  
  if (rubricInput === "No rubric") {  
   // No rubric added (obviously)  
  }  
  else {  
   message += `Here is the rubric given: ${rubricInput}`;  
  }  
  console.log(promptInput);  
  message += `Here is the prompt (if there is one, along with any other important directions): ${promptInput}`  
  console.log("message", message);  
  
  let message2 = `Here is the essay I would like you to give feedback for: ${essayInput}. Its grade is ${(predictedGrade).toFixed(1)}`;  
  for (const subgrade in subgradePredictions) {  
   message2 += `Grade for ${subgrade}: ${(subgradePredictions[subgrade]).toFixed(1)}`  
  }  
  message2 += `Make sure to list the final grade out of the maximum shown out of all essays for each grade (both main and sub) before giving feedback for each section. After all subgrades, also give score out of 100 (based on the strictness of the other criteria) for conciseness, conventions, detail, and descriptions (also only give feedback on the essay I just gave - all previous ones given by system were examples`  
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
   const formattedFeedbackfinal = lines.map(line => line.trim() + "<br>").join("");  
  
   document.getElementById("output").innerHTML = formattedFeedbackfinal;  
  
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
  
// // Function to update progress bar   
// function updateProgress(percentage, totalTimeTaken, trainingLabel) {   
//   console.log("Updating progress bar...");   
//   console.log("Percentage: " + percentage);   
//   console.log("Total time taken: " + totalTimeTaken);   
//   console.log("Training label: " + trainingLabel);   
  
//   // Ensure the percentage is between 0 and 100   
//   percentage = Math.max(0, Math.min(100, percentage));   
//   percentage = percentage.toFixed(2);   
  
//   // Get the loading bar and percentage label elements   
//   const loadingBar = document.getElementById("loading_bar");   
//   const percentageLabel = document.getElementById("percentage_label");   
//   const timeLabel = document.getElementById("time_label");   
//   const trainingLabelElement = document.getElementById("training_label");   
  
//   // Update the width of the loading bar   
//   loadingBar.style.width = percentage + "%";   
  
//   // Update the percentage label text   
//   percentageLabel.textContent = percentage + "%";   
  
//   // Update the training label text   
//   trainingLabelElement.textContent = trainingLabel;   
  
//   // Calculate the estimated total time based on total time taken and  done   
//   if (percentage > 0) {   
//    const elapsedTime = totalTimeTaken; // Time in seconds taken for the completed epochs   
  
//    // Estimate the total time based on the current progress (linear approximation)   
//    const expectedTotalTime = elapsedTime / (percentage / 100); // Estimate total time   
  
//    // Calculate remaining time   
//    const remainingTime = expectedTotalTime - elapsedTime;   
  
//    // Format time (minutes:seconds)   
//    const formatTime = (timeInSeconds) => {   
//     const minutes = Math.floor(timeInSeconds / 60);   
//     const seconds = Math.floor(timeInSeconds % 60);   
//     return `${minutes} minutes - ${seconds   
//       .toString()   
//       .padStart(2, "0")} seconds`;   
//    };   
  
//    // Display the time taken and expected total time in a human-readable format   
//    const timeTaken = formatTime(elapsedTime);   
//    const totalTime = formatTime(expectedTotalTime);   
  
//    // Update the label with time information   
//    timeLabel.textContent = `${timeTaken} / ${totalTime}`;   
//   }   
// }   
  
// let percentage = 0;  
// async function predictGradealt(inputEssaysMG, inputGradesMG, essayInput, promptInput, rubricInput, inputEssaysSG, inputGradesSG) {  
//   console.log("Getting feedback...");  
  
//   // Calculate the maximum grade  
//   let maxGrade2 = Math.max(...inputGradesMG);  
  
//   // Format the message  
//   let message = `Here is the rubric given: ${rubricInput}`;  
//   message += ` Here is the prompt (along with any other important directions): ${promptInput}`;  
//   message += ` Here are example essays for grading reference (if given): `  
  
//   // Loop through each essay and add it to the message  
//   for (let i = 0; i < inputEssaysMG.length; i++) {  
//    message += `Essay ${(i + 1)}: ${inputEssaysMG[i]} - Overall Grade: ${inputGradesMG[i]} `;  
//    // Loop through each subgrade and add it to the message  
//    for (const subgrade in inputEssaysSG) {  
//     if (inputEssaysSG[subgrade][i] && inputGradesSG[subgrade][i]) {  
//       message += ` - ${subgrade}: ${inputGradesSG[subgrade][i]} `;  
//     }  
//    }  
//   }  
  
//   console.log("message for new function", message);  
  
//   // Format the message2  
//   let message2 = `Here is the essay I would like you to grade: ${essayInput}`;  
//   message2 += ` ONLY give the grade out of ${maxGrade2} - NO TEXT (NO feedback, just one number and nothing else (specific to one decimal point) - just give one integer value and nothing else so it can be converted into a number in javascript :)`;  
//   console.log("message2 for new function", message2);  
  
//   let gradesofar = 0;  
//   let minGrade = Infinity;  
//   let maxGrade = -Infinity;  
  
//   const params = {  
//    messages: [  
//     {  
//       role: "system",  
//       content: message,  
//     },  
//     {  
//       role: "user",  
//       content: message2,  
//     },  
//    ],  
//    model: "llama3-8b-8192",  
//   };  
  
//   for (let i = 0; i < 10; i++) {  
//    try {  
//     const chatCompletion = await client.chat.completions.create(params);  
//     console.log(chatCompletion);  
  
//     const { id, model, created, choices, usage } = chatCompletion;  
//     const messageContent = choices[0].message.content;  
//     const grade = Number(messageContent);  
  
//     // Update gradesofar, minGrade, and maxGrade  
//     gradesofar += grade;  
//     if (grade < minGrade) minGrade = grade;  
//     if (grade > maxGrade) maxGrade = grade;  
  
//     // Log the current average, min, and max grades  
//     console.log(`Epoch ${i + 1}:`);  
//     console.log(`  Current Average Grade: ${(gradesofar / (i + 1)).toFixed(1)}`);  
//     console.log(`  Minimum Grade: ${minGrade}`);  
//     console.log(`  Maximum Grade: ${maxGrade}`);  
//     console.log("ID:", id);  
//     console.log("Model:", model);  
//     console.log("Created Timestamp:", created);  
//     console.log("Message Content:", messageContent);  
//     console.log("Prompt Tokens Used:", usage.prompt_tokens);  
//     console.log("Total Tokens Used:", usage.total_tokens);  
//    } catch (err) {  
//     if (err instanceof Groq.APIError) {  
//       console.error("API Error:", err);  
//       document.getElementById("output").textContent = "Error";  
//     } else {  
//       console.error("Unexpected Error:", err);  
//       document.getElementById("output").textContent = "An unexpected error occurred.";  
//     }  
//    }  
  
//    // Wait for 2.4 seconds before the next iteration  
//    await sleep(2400);  
//   }  
  
//   // Call the feedback function  
//   const feedbackInput = {  
//    essays: [],  
//    grades: [],  
//    subgrades: {},  
//    feedback: [],  
//   };  
  
//   for (let i = 0; i < inputEssaysMG.length; i++) {  
//    feedbackInput.essays.push(inputEssaysMG[i]);  
//    feedbackInput.grades.push(inputGradesMG[i]);  
//    feedbackInput.feedback.push('');  
  
//    for (const subgrade in inputEssaysSG) {  
//     if (!feedbackInput.subgrades[subgrade]) {  
//       feedbackInput.subgrades[subgrade] = [];  
//     }  
//     feedbackInput.subgrades[subgrade].push(inputGradesSG[subgrade][i]);  
//    }  
//   }  
  
//   const output = await feedback(  
//    feedbackInput.essays,  
//    feedbackInput.grades,  
//    inputEssaysSG,  
//    inputGradesSG,  
//    feedbackInput.feedback,  
//    {},  
//    0,  
//    essayInput,  
//    promptInput,  
//    rubricInput  
//   );  
//   // second attempt feedback loop is useless and wastes tokens (at least the outputs other than the grade values)
  // using GROQ chat bot for predictions failed horribly 💀
export { feedback };


