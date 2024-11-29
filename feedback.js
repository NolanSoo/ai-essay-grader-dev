// Import the Groq SDK
import Groq from "https://cdn.jsdelivr.net/npm/groq-sdk@0.8.0/+esm";

// Initialize the Groq client
const client = new Groq({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

// Function to get feedback from the model
async function feedback(inputEssaysMG, inputGradesMG, inputEssaysSG, inputGradesSG, inputFeedbackMG, subgradePredictions, predictedGrade, essayInput) {
  console.log("Getting feedback...");

  let message = "Hello. Please give professional feedback on essays (1-2 sentences for overall and for every subgrade)..."; // Truncated for clarity
  for (let i = 0; i < inputEssaysMG.length; i++) {
    message += `Essay ${i}: ${inputEssaysMG[i]} - Main Grade: ${inputGradesMG[i]} - Feedback: ${inputFeedbackMG[i]}`;
    for (const subgrade in inputEssaysSG) {
      message += `Subgrade ${subgrade}: ${inputEssaysSG[subgrade][i]} - Grade: ${inputGradesSG[subgrade][i]}`;
    }
  }
  
  console.log("message", message);

  let message2 = `Here is the essay I would like you to give feedback for: ${essayInput}. Its grade is ${(predictedGrade).toFixed(1)}. `;
  for (const subgrade in subgradePredictions) {
    message2 += `Grade for ${subgrade}: ${(subgradePredictions[subgrade]).toFixed(1)}. `;
  }
  message2 += `Make sure to use this format: Overall Grade: {grade} + {feedback}, Subgrade {n}: {subgrade name} + {grade} + {feedback}... etc. `;
  
  console.log("message2", message2);

  const params = {
    messages: [
      { role: "system", content: message },
      { role: "user", content: message2 },
    ],
    model: "llama3-8b-8192",
  };

  try {
    // Make the API call
    const chatCompletion = await client.chat.completions.create(params);
    console.log(chatCompletion);

    // Extract the main fields
    const { choices } = chatCompletion;
    const messageContent = choices[0].message.content;

    // Format the response for HTML display
    let formattedFeedback = messageContent.replace(/\n\n/g, '<br>'); // Handle double newlines
    formattedFeedback = formattedFeedback.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold text

    // Split into lines and append line breaks
    const lines = formattedFeedback.trim().split("\n");
    const formattedFeedbackfinal = lines.map(line => line.trim() + "<br>").join("");

    // Display the formatted response in the "output" div
    const outputDiv = document.getElementById("output");
    if (outputDiv) {
      outputDiv.innerHTML = formattedFeedbackfinal;
    } else {
      console.error("Error: Element with ID 'output' not found.");
    }

  } catch (err) {
    // Handle API errors
    if (err instanceof Groq.APIError) {
      console.error("API Error:", err);
      const outputDiv = document.getElementById("output");
      if (outputDiv) {
        outputDiv.textContent = `Error: ${err.name} (${err.status})`;
      }
    } else {
      // Handle other errors
      console.error("Unexpected Error:", err);
      const outputDiv = document.getElementById("output");
      if (outputDiv) {
        outputDiv.textContent = "An unexpected error occurred.";
      }
    }
  }
}

export { feedback };
