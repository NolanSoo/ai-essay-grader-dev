 // Import the Groq SDK
  import Groq from "https://cdn.jsdelivr.net/npm/groq-sdk@0.8.0/+esm";

  // Initialize the Groq client
  const client = new Groq({
    apiKey: "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",
    dangerouslyAllowBrowser: true,
  });

  // Function to get feedback from the model
  async function feedback(inputEssaysMG, inputGradesMG, inputEssaysSG, inputGradesSG, inputFeedbackMG) {
    console.log("Getting feedback...");

    let message = "Hello. Please give professional feedback on essays (1-2 sentences for overall and for every subgrade)..."; // Truncated for clarity
    for (let i = 0; i < inputEssaysMG.length; i++) {
      message += `Essay ${i}: ${inputEssaysMG[i]} - Main Grade: ${inputGradesMG[i]} - Feedback: ${inputFeedbackMG[i]}`;
      for (const subgrade in inputEssaysSG) {
        message += `Subgrade ${subgrade}: ${inputEssaysSG[subgrade][i]} - Grade: ${inputGradesSG[subgrade][i]}`;
      }
    }
    console.log("message", message);
    const params = {
      messages: [
        {
          role: "system",
          content: message,
        },
        {
          role: "user",
          content: "ESSAY",
        },
      ],
      model: "llama3-8b-8192",
    };

    try {
      // Make the API call
      const chatCompletion = await client.chat.completions.create(params);
      console.log(chatCompletion);

      // Display the response in the output div
      document.getElementById("output").textContent = JSON.stringify(
        chatCompletion,
        null,
        2
      );

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
export { feedback };
