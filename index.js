let finalModel;
let subgradeCount = 0; // Track number of subgrades

function updateProgress(percentage, totalTimeTaken) {
  // Ensure the percentage is between 0 and 100
  percentage = Math.max(0, Math.min(100, percentage));
  percentage = percentage.toFixed(2);

  // Get the loading bar and percentage label elements
  const loadingBar = document.getElementById("loading_bar");
  const percentageLabel = document.getElementById("percentage_label");

  // Update the width of the loading bar
  loadingBar.style.width = percentage + "%";
  percentageLabel.textContent = percentage + "%";

  if (percentage > 0) {
    const elapsedTime = totalTimeTaken;
    const expectedTotalTime = elapsedTime / (percentage / 100);
    const remainingTime = expectedTotalTime - elapsedTime;

    const formatTime = (timeInSeconds) => {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes} minutes - ${seconds.toString().padStart(2, "0")} seconds`;
    };

    const timeTaken = formatTime(elapsedTime);
    const totalTime = formatTime(expectedTotalTime);

    const timeLabel = document.getElementById("time_label");
    timeLabel.textContent = `${timeTaken} / ${totalTime}`;
  }
}

// Function for training the model
async function trainModel() {
  const mainGradeInputEssays = [];
  const mainGradeTargets = [];
  const subgradeTargets = Array.from({ length: subgradeCount }, () => []);

  // Ensure the preprocessText function is defined in this scope
  function preprocessText(essays) {
    const tokenizedInputs = essays.map((essay) => {
      const words = essay.trim().split(/\s+/);
      const vector = new Array(1200).fill(0);
      for (let word of words) {
        const index = Math.min(word.length, 1199);
        vector[index] += 1;
      }
      return vector;
    });
    return tf.tensor2d(tokenizedInputs);
  }

  const rows = document.querySelectorAll("#data_table tr:not(:first-child)");
  rows.forEach((row, idx) => {
    if (idx === rows.length - 1) return; // Skip last row (new essay row)
    const essay = row.querySelector("td:nth-child(1)").innerText.trim();
    const mainGrade = parseInt(row.querySelector("td:nth-child(2)").innerText.trim());
    const subgrades = Array.from(row.querySelectorAll(".subgrade_col input")).map(
      (input) => parseInt(input.value.trim()) || 0
    );

    mainGradeInputEssays.push(essay);
    mainGradeTargets.push(mainGrade);
    subgrades.forEach((grade, i) => subgradeTargets[i].push(grade));
  });

  const inputTensor = preprocessText(mainGradeInputEssays);
  const mainGradeTensor = tf.tensor1d(mainGradeTargets);
  const subgradeTensors = subgradeTargets.map((grades) => tf.tensor1d(grades));

  finalModel = tf.sequential();
  finalModel.add(tf.layers.dense({ inputShape: [1200], units: 1 }));
  finalModel.compile({ optimizer: "adam", loss: "meanSquaredError" });

  // Train Main Grade Model
  await finalModel.fit(inputTensor, mainGradeTensor, { epochs: 300 });

  // Train Subgrade Models
  for (let i = 0; i < subgradeCount; i++) {
    const subgradeModel = tf.sequential();
    subgradeModel.add(tf.layers.dense({ inputShape: [1200], units: 1 }));
    subgradeModel.compile({ optimizer: "adam", loss: "meanSquaredError" });
    await subgradeModel.fit(inputTensor, subgradeTensors[i], { epochs: 300 });
  }
}

// Function for predicting the grade
async function predictGrade() {
  const essayInput = document.getElementById("new_essay_input").value.trim();
  
  if (!essayInput) {
    alert("Please enter an essay to predict the grade.");
    return;
  }

  function preprocessText(essays) {
    const tokenizedInputs = essays.map((essay) => {
      const words = essay.trim().split(/\s+/);
      const vector = new Array(1200).fill(0);
      for (let word of words) {
        const index = Math.min(word.length, 1199);
        vector[index] += 1;
      }
      return vector;
    });
    return tf.tensor2d(tokenizedInputs);
  }

  const essayTensor = preprocessText([essayInput]);

  const mainPrediction = await finalModel.predict(essayTensor).data();

  // For subgrades, predict using their models
  const subgradePredictions = [];
  for (let i = 0; i < subgradeCount; i++) {
    const subgradePrediction = await subgradeModels[i].predict(essayTensor).data();
    subgradePredictions.push(subgradePrediction[0]);
  }

  document.getElementById("predicted_grade_output").textContent = `Predicted Grade: ${mainPrediction[0]}\nSubgrades: ${subgradePredictions.join(", ")}`;
}

function add_row() {
  const newEssay = document.getElementById("new_essay").value;
  const newGrade = document.getElementById("new_main_grade").value;
  
  if (newEssay && newGrade) {
    const table = document.getElementById("data_table");
    const rowCount = table.rows.length;
    const row = table.insertRow(rowCount - 1); // Insert before the last row
    row.id = `row${rowCount}`;

    row.insertCell(0).innerHTML = newEssay;
    row.insertCell(1).innerHTML = newGrade;
    const removeButton = document.createElement("input");
    removeButton.type = "button";
    removeButton.value = "Remove Essay";
    removeButton.classList.add("delete");
    removeButton.onclick = () => delete_row(rowCount);
    row.insertCell(2).appendChild(removeButton);
  }
}

function delete_row(rowId) {
  const row = document.getElementById(`row${rowId}`);
  row.remove();
}

function addSubgradeColumn() {
  subgradeCount++;
  const table = document.getElementById("data_table");
  const rows = table.querySelectorAll("tr");
  
  rows.forEach((row, idx) => {
    if (idx === 0) return; // Skip header row

    const subgradeCell = row.insertCell(2);
    subgradeCell.innerHTML = `<input type="text" class="subgrade_col" />`;
  });
}
