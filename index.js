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

function addNewSubgradeColumn() {
  const table = document.getElementById("data_table");
  const headersRow = table.rows[0];
  const columnIndex = headersRow.cells.length;

  // Add header
  const th = document.createElement("th");
  th.innerText = `Subgrade ${columnIndex - 2}`;
  headersRow.appendChild(th);

  // Add input fields for subgrades
  for (let i = 1; i < table.rows.length - 1; i++) {
    const cell = table.rows[i].insertCell(-1);
    cell.innerHTML = `<input type="text" class="subgrade_input" />`;
  }

  // Add empty cell for the input row
  table.rows[table.rows.length - 1].insertCell(-1).innerHTML = "";

  // Add new subgrade model
  const subgradeModel = createModel();
  subgradeModels.push(subgradeModel);
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
    for (let j = 0; j < subgrades.length; j++) {
      const value = cells[j + 2]?.querySelector("input").value || 0;
      subgrades[j].push(parseInt(value, 10));
    }
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
  const row = table.insertRow(table.rows.length - 1);

  row.innerHTML = `
    <td>${newEssay}</td>
    <td>${newGrade}</td>
    ${subgradeModels.map(() => `<td><input type="text" class="subgrade_input" /></td>`).join("")}
    <td><input type="button" value="Remove Essay" onclick="deleteRow(${table.rows.length - 1})" /></td>`;
}

function deleteRow(index) {
  document.getElementById("data_table").deleteRow(index);
}
