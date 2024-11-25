var finalModel;
var subgradeModels = [];

function preprocessText(essays) {
  return tf.tensor2d(
    essays.map((essay) => {
      const vector = new Array(1200).fill(0);
      essay
        .trim()
        .split(/\s+/)
        .forEach((word) => {
          const index = Math.min(word.length, 1199);
          vector[index] += 1;
        });
      return vector;
    })
  );
}

function moveActionsToLast() {
  const table = document.getElementById("data_table");

  for (let row of table.rows) {
    const actionsCell = row.cells[row.cells.length - 1]; // Current last cell
    row.appendChild(actionsCell); // Move actions cell to the end
  }
}

function initializeTable() {
  moveActionsToLast();
}

function addNewSubgradeColumn() {
  const table = document.getElementById("data_table");
  const headersRow = table.rows[0];
  const actionsColumnIndex = headersRow.cells.length - 1;

  // Add header for new subgrade column
  const th = document.createElement("th");
  th.innerText = `Subgrade ${actionsColumnIndex - 1}`;
  headersRow.insertBefore(th, headersRow.cells[actionsColumnIndex]);

  // Add input fields for subgrades in each data row
  for (let i = 1; i < table.rows.length - 1; i++) {
    const cell = table.rows[i].insertCell(actionsColumnIndex - 1);
    cell.innerHTML = `<input type="text" class="subgrade_input" />`;
  }

  // Add an empty cell for the input row (last row)
  const inputRow = table.rows[table.rows.length - 1];
  const cell = inputRow.insertCell(actionsColumnIndex - 1);
  cell.innerHTML = ""; // No input required here for new subgrade

  // Add new subgrade model
  const subgradeModel = createModel();
  subgradeModels.push(subgradeModel);

  // Ensure actions remain at the last column
  moveActionsToLast();
}

function createModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [1200], units: 1 }));
  model.compile({ optimizer: tf.train.adam(0.005), loss: "meanSquaredError" });
  return model;
}

async function trainModels() {
  const table = document.getElementById("data_table");
  const essays = [];
  const mainGrades = [];
  const subgrades = Array.from({ length: subgradeModels.length }, () => []);

  // Extract data
  for (let i = 1; i < table.rows.length - 1; i++) {
    const cells = table.rows[i].cells;
    essays.push(cells[0].innerText.trim());
    mainGrades.push(parseInt(cells[1].innerText.trim(), 10));

    // Gather subgrades
    for (let j = 0; j < subgrades.length; j++) {
      const inputElement = cells[j + 2]?.querySelector("input");
      const value = inputElement?.value || 0; // Default to 0 if empty
      subgrades[j].push(parseInt(value, 10));
    }
  }

  // Validate data
  if (essays.length === 0 || mainGrades.length === 0) {
    alert("No data to train on.");
    return;
  }

  // Train main grade model
  const inputTensor = preprocessText(essays);
  const mainGradeTensor = tf.tensor1d(mainGrades);
  finalModel = createModel();
  await finalModel.fit(inputTensor, mainGradeTensor, { epochs: 50 });

  // Train subgrade models
  for (let i = 0; i < subgradeModels.length; i++) {
    const subgradeTensor = tf.tensor1d(subgrades[i]);
    await subgradeModels[i].fit(inputTensor, subgradeTensor, { epochs: 50 });
  }

  document.getElementById("output").innerText = "Models trained!";
  document.getElementById("predict_section").style.display = "block";
}

async function predictGrade() {
  const essayInput = document.getElementById("new_essay_input").value.trim();
  if (!essayInput) {
    alert("Please enter an essay.");
    return;
  }

  const inputTensor = preprocessText([essayInput]);

  // Predict main grade
  const mainGradePrediction = await finalModel.predict(inputTensor).data();
  document.getElementById("predicted_grade_output").innerText = `Predicted Grade: ${mainGradePrediction[0].toFixed(
    2
  )}`;

  // Predict subgrades
  const subgradesOutput = subgradeModels.map(async (model, index) => {
    const prediction = await model.predict(inputTensor).data();
    return `Subgrade ${index + 1}: ${prediction[0].toFixed(2)}`;
  });

  const results = await Promise.all(subgradesOutput);
  document.getElementById("subgrades_outputs").innerHTML = results
    .map((r) => `<p>${r}</p>`)
    .join("");
}

function addRow() {
  const table = document.getElementById("data_table");
  const newEssay = document.getElementById("new_essay").value.trim();
  const newGrade = document.getElementById("new_grade").value.trim();
  const actionsColumnIndex = table.rows[0].cells.length - 1;

  if (!newEssay || !newGrade) {
    alert("Please enter both essay and grade.");
    return;
  }

  const row = table.insertRow(table.rows.length - 1);
  row.innerHTML = `
    <td>${newEssay}</td>
    <td>${newGrade}</td>
    ${subgradeModels
      .map(() => `<td><input type="text" class="subgrade_input" /></td>`)
      .join("")}
    <td><input type="button" value="Remove Essay" onclick="deleteRow(${table.rows.length - 1})" /></td>`;

  moveActionsToLast();
}

function deleteRow(index) {
  document.getElementById("data_table").deleteRow(index);
}

// Initialize the table on load
window.onload = initializeTable;

