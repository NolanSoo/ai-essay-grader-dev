 // Import the Groq SDK
  import Groq from "https://cdn.jsdelivr.net/npm/groq-sdk@0.8.0/+esm";

  // Initialize the Groq client
  const client = new Groq({
    apiKey: "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",
    dangerouslyAllowBrowser: true,
  });

  // Function to get feedback from the model
  async function feedback(inputEssaysMG, inputGradesMG, inputEssaysSG, inputGradesSG, inputFeedbackMG, subgradePredictions, predictedGrade, essayInput, promptInput, rubricInput) {
    console.log("Getting feedback...");

    let message = "Hello. Please give professional feedback on essays (1-2 sentences for overall and for every subgrade)..."; // Truncated for clarity
    for (let i = 0; i < inputEssaysMG.length; i++) {
      message += `Essay ${i}: ${inputEssaysMG[i]} - Main Grade: ${inputGradesMG[i]} - Feedback: ${inputFeedbackMG[i]}`;
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
   
   let message2 = `Here is the essay I would like you to give feedback for: ${essayInput}. Its grade is ${(predictedGrade).toFixed(1)}`; // it gives one decimal place for more specificity not usually possible with human grading 
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
export { feedback };

// Helper function to pause execution for a given time (in milliseconds)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function predictGradealt(essayInput, promptInput, rubricInput, inputEssaysMG, inputGradesMG, inputEssaysSG, inputGradesSG) {
    console.log("Getting feedback...");

    let message = `Here is the rubric given: ${rubricInput}`;
    console.log(promptInput);
    message += ` Here is the prompt (along with any other important directions): ${promptInput}`;
    console.log("message for new function", message);

    let message2 = `Here is the essay I would like you to grade: ${essayInput}`;

    message2 += " ONLY give the grade out of 3 (grades from 1 to 3) - NO TEXT (NO feedback, just one number and nothing else (specific to one decimal point - like 3.9) - just give one integer value and nothing else so it can be converted into a number in javascript :)";
    console.log("message2 for new function", message2);

    let gradesofar = 0;
    let minGrade = Infinity;
    let maxGrade = -Infinity;

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

    for (let i = 0; i < 10; i++) {
        try {
            const chatCompletion = await client.chat.completions.create(params);
            console.log(chatCompletion);

            const { id, model, created, choices, usage } = chatCompletion;
            const messageContent = choices[0].message.content;
            const grade = Number(messageContent);

            // Update gradesofar, minGrade, and maxGrade
            gradesofar += grade;
            if (grade < minGrade) minGrade = grade;
            if (grade > maxGrade) maxGrade = grade;

            // Log the current average, min, and max grades
            console.log(`Epoch ${i + 1}:`);
            console.log(`  Current Average Grade: ${(gradesofar / (i + 1)).toFixed(1)}`);
            console.log(`  Minimum Grade: ${minGrade}`);
            console.log(`  Maximum Grade: ${maxGrade}`);
            console.log("ID:", id);
            console.log("Model:", model);
            console.log("Created Timestamp:", created);
            console.log("Message Content:", messageContent);
            console.log("Prompt Tokens Used:", usage.prompt_tokens);
            console.log("Total Tokens Used:", usage.total_tokens);
        } catch (err) {
            if (err instanceof Groq.APIError) {
                console.error("API Error:", err);
                document.getElementById("output").textContent = "Error";
            } else {
                console.error("Unexpected Error:", err);
                document.getElementById("output").textContent = "An unexpected error occurred.";
            }
        }

        // Wait for 2.1 seconds before the next iteration - this overall code is just to test LLaMA augmented grades and compare using table only vs LLaMA only vs both (I predict both will be better)
        await sleep(2100);
    }
}

export { predictGradealt };

