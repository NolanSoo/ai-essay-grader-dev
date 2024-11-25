   var finalModel;


  function updateProgress(percentage, totalTimeTaken) {
    // Ensure the percentage is between 0 and 100
    percentage = Math.max(0, Math.min(100, percentage));
    percentage = percentage.toFixed(2);

    // Get the loading bar and percentage label elements
    const loadingBar = document.getElementById("loading_bar");
    const percentageLabel = document.getElementById("percentage_label");

    // Update the width of the loading bar
    loadingBar.style.width = percentage + "%";

    // Update the percentage label text
    percentageLabel.textContent = percentage + "%";

    // Calculate the estimated total time based on total time taken and percentage done
    if (percentage > 0) {
      const elapsedTime = totalTimeTaken; // Time in seconds taken for the completed epochs

      // Estimate the total time based on the current progress (linear approximation)
      const expectedTotalTime = elapsedTime / (percentage / 100); // Estimate total time

      // Calculate remaining time
      const remainingTime = expectedTotalTime - elapsedTime;

      // Format time (minutes:seconds)
      const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes} minutes - ${seconds
          .toString()
          .padStart(2, "0")} seconds`;
      };

      // Display the time taken and expected total time in a human-readable format
      const timeTaken = formatTime(elapsedTime);
      const totalTime = formatTime(expectedTotalTime);

      // Update the label with time information
      const timeLabel = document.getElementById("time_label");
      timeLabel.textContent = `${timeTaken} / ${totalTime}`;
    }
  }

      // Function for predicting the grade
      async function predictGrade() {
  const essayInput = document.getElementById("new_essay_input").value.trim();

  if (!essayInput) {
    alert("Please enter an essay to predict the grade.");
    return;
  }

  const essayTensor = preprocessText([essayInput]);

  const mainPrediction = await finalModel.predict(essayTensor).data();

  // For subgrades, predict using their models
  const subgradePredictions = [];
  for (let i = 0; i < subgradeCount; i++) {
    const subgradePrediction = await subgradeModels[i].predict(essayTensor).data();
    subgradePredictions.push(subgradePrediction[0]);
  }

  document.getElementById("predicted_grade_output").innerText = `
    Predicted Main Grade: ${mainPrediction[0].toFixed(2)}
    ${subgradePredictions.map((grade, i) => `Subgrade ${i + 1}: ${grade.toFixed(2)}`).join("\n")}
  `;
}


      // Function for training the model
      async function trainModel() {
  const mainGradeInputEssays = [];
  const mainGradeTargets = [];
  const subgradeTargets = Array.from({ length: subgradeCount }, () => []);

  const rows = document.querySelectorAll("#data_table tr:not(:first-child)");
  rows.forEach((row, idx) => {
    if (idx === rows.length - 1) return; // Skip last row
    const essay = row.querySelector("td:nth-child(1)").innerText.trim();
    const mainGrade = parseInt(row.querySelector("td:nth-child(2)").innerText.trim());
    const subgrades = Array.from(row.querySelectorAll(".subgrade_col input"))
      .map((input) => parseInt(input.value.trim()) || 0);

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


      document
  .getElementById("predict_grade")
  .addEventListener("click", predictGrade);
// i know this is worst syntax of all time :(
let subgradeCount = 0; // Track number of subgrades

function addSubgradeColumn() {
  subgradeCount++;
  const table = document.getElementById("data_table");

  // Add a new column header
  const headerRow = table.rows[0];
  const newHeaderCell = headerRow.insertCell(headerRow.cells.length - 1);
  newHeaderCell.innerHTML = `Subgrade ${subgradeCount}`;
  newHeaderCell.setAttribute("class", `subgrade_col`);

  // Add new cells for each existing row
  for (let i = 1; i < table.rows.length; i++) {
    const newCell = table.rows[i].insertCell(table.rows[i].cells.length - 1);
    newCell.innerHTML = `<input type="text" id="subgrade${subgradeCount}_row${i}" />`;
    newCell.setAttribute("class", `subgrade_col`);
  }
}

      function edit_row(no) {
        document.getElementById("edit_button" + no).style.display = "none";

        var essayCell = document.getElementById("essay_row" + no);
        var gradeCell = document.getElementById("grade_row" + no);

        var essayData = essayCell.innerHTML;
        var gradeData = gradeCell.innerHTML;

        essayCell.innerHTML =
          "<input type='text' id='essay_text" +
          no +
          "' value='" +
          essayData +
          "'>";
        gradeCell.innerHTML =
          "<input type='text' id='grade_text" +
          no +
          "' value='" +
          gradeData +
          "'>";
      }

      // Modify the save_row function
      function save_row(no) {
        var essayVal = document.getElementById("essay_text" + no).value;
        var gradeVal = document.getElementById("grade_text" + no).value;

        document.getElementById("name_row" + no).innerHTML = essayVal;
        document.getElementById("country_row" + no).innerHTML = gradeVal;

        document.getElementById("edit_button" + no).style.display = "block";
      }

      // Modify the add_row function
      function add_row() {
  const newEssay = document.getElementById("new_name").value;
  const newMainGrade = document.getElementById("new_main_grade").value;

  const table = document.getElementById("data_table");
  const tableLen = table.rows.length - 2; // Exclude header and last row

  const newRow = table.insertRow(tableLen + 1);
  newRow.id = `row${tableLen + 1}`;

  // Add Essay and Main Grade
  newRow.innerHTML = `
    <td id="essay_row${tableLen + 1}">${newEssay}</td>
    <td id="grade_row${tableLen + 1}">${newMainGrade}</td>
  `;

  // Add Subgrade Columns
  for (let i = 1; i <= subgradeCount; i++) {
    const subgradeCell = newRow.insertCell(newRow.cells.length);
    subgradeCell.innerHTML = `<input type="text" id="subgrade${i}_row${tableLen + 1}" />`;
    subgradeCell.setAttribute("class", `subgrade_col`);
  }

  // Add Action Buttons
  const actionCell = newRow.insertCell(newRow.cells.length);
  actionCell.innerHTML = `
    <input type="button" value="Remove" class="delete" onclick="delete_row(${tableLen + 1})" />
  `;

  document.getElementById("new_name").value = "";
  document.getElementById("new_main_grade").value = "";
}


      // Modify the delete_row function to match the new row structure
      function delete_row(no) {
        document.getElementById("row" + no).outerHTML = "";
      }
