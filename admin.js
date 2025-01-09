import { fetchScoresFromIndexedDB, openDatabase } from "./db.js";

const scoresContainer = document.getElementById("scores-container");
const scoresTable = document
  .getElementById("scores-table")
  .getElementsByTagName("tbody")[0];
const prevButton = document.getElementById("prev-page");
const nextButton = document.getElementById("next-page");
const exportButton = document.getElementById("export-button");

// Filter inputs
const classFilter = document.getElementById("class-filter");
const nameFilter = document.getElementById("name-filter");
const minScore = document.getElementById("min-score");
const maxScore = document.getElementById("max-score");
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");

// Pagination settings
let currentPage = 1;
let recordsPerPage = 10;
let allScores = [];

// Fetch and display scores
function loadScores() {
  fetchScoresFromIndexedDB()
    .then((scores) => {
      allScores = scores;
      displayScores(getPagedData());
      updatePaginationControls();
    })
    .catch((error) => {
      console.error("Error fetching scores:", error);
      alert("Error fetching scores");
    });
}

// Filter the scores based on the filter criteria
function filterScores(scores) {
  return scores.filter((score) => {
    const classMatch = classFilter.value
      ? score.class === classFilter.value
      : true;
    const nameMatch = nameFilter.value
      ? score.name.toLowerCase().includes(nameFilter.value.toLowerCase())
      : true;
    const minScoreMatch = minScore.value ? score.score >= minScore.value : true;
    const maxScoreMatch = maxScore.value ? score.score <= maxScore.value : true;
    const dateMatch =
      startDate.value || endDate.value
        ? (startDate.value
            ? new Date(score.date) >= new Date(startDate.value)
            : true) &&
          (endDate.value
            ? new Date(score.date) <= new Date(endDate.value)
            : true)
        : true;
    return (
      classMatch && nameMatch && minScoreMatch && maxScoreMatch && dateMatch
    );
  });
}

// Sort the scores based on the column and direction
function sortScores(scores, column, direction = "asc") {
  return scores.sort((a, b) => {
    if (a[column] < b[column]) return direction === "asc" ? -1 : 1;
    if (a[column] > b[column]) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

// Display the scores in the table
function displayScores(scores) {
  scoresTable.innerHTML = "";
  if (scores.length === 0) {
    scoresTable.innerHTML = '<tr><td colspan="5">No scores found.</td></tr>';
    return;
  }

  scores.forEach((score) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${score.name}</td>
      <td>${score.class}</td>
      <td>${score.score}</td>
      <td>${new Date(score.date).toLocaleString()}</td>
      <td><button class="delete-button" data-id="${
        score.id
      }">Delete</button></td>
    `;
    scoresTable.appendChild(row);
  });

  // Add delete functionality
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const scoreId = e.target.getAttribute("data-id");
      console.log("Delete button clicked for score ID:", scoreId); // Debugging log
      deleteScore(scoreId);
    });
  });
}

// Handle deleting a score from IndexedDB
function deleteScore(scoreId) {
  console.log("Attempting to delete score with ID:", scoreId); // Debugging log
  openDatabase()
    .then((db) => {
      console.log("Database opened successfully."); // Debugging log
      const transaction = db.transaction("scores", "readwrite");
      const store = transaction.objectStore("scores");
      const deleteRequest = store.delete(Number(scoreId)); // Ensure the ID is a number
      deleteRequest.onsuccess = () => {
        console.log("Score deleted successfully!"); // Debugging log
        loadScores(); // Reload the scores after deletion
      };
      deleteRequest.onerror = (error) => {
        console.error("Failed to delete score:", error);
      };
    })
    .catch((error) => {
      console.error("Error opening the database:", error);
    });
}

// Update pagination controls
function updatePaginationControls() {
  const filteredScores = filterScores(allScores);
  const totalPages = Math.ceil(filteredScores.length / recordsPerPage);
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
}

// Get the scores for the current page
function getPagedData() {
  const filteredScores = filterScores(allScores);
  const sortedScores = sortScores(filteredScores, "date", "desc");
  const start = (currentPage - 1) * recordsPerPage;
  const end = start + recordsPerPage;
  return sortedScores.slice(start, end);
}

// Handle page navigation
prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayScores(getPagedData());
    updatePaginationControls();
  }
});

nextButton.addEventListener("click", () => {
  const filteredScores = filterScores(allScores);
  const totalPages = Math.ceil(filteredScores.length / recordsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayScores(getPagedData());
    updatePaginationControls();
  }
});

// Handle filter changes
classFilter.addEventListener("change", () => {
  currentPage = 1; // Reset to first page when filter changes
  displayScores(getPagedData());
});
nameFilter.addEventListener("input", () => {
  currentPage = 1; // Reset to first page when filter changes
  displayScores(getPagedData());
});
minScore.addEventListener("input", () => {
  currentPage = 1; // Reset to first page when filter changes
  displayScores(getPagedData());
});
maxScore.addEventListener("input", () => {
  currentPage = 1; // Reset to first page when filter changes
  displayScores(getPagedData());
});
startDate.addEventListener("input", () => {
  currentPage = 1; // Reset to first page when filter changes
  displayScores(getPagedData());
});
endDate.addEventListener("input", () => {
  currentPage = 1; // Reset to first page when filter changes
  displayScores(getPagedData());
});

// Export data to CSV
exportButton.addEventListener("click", () => {
  const filteredScores = filterScores(allScores);
  const csvContent = generateCSV(filteredScores);
  downloadCSV(csvContent);
});

// Generate CSV content from filtered scores
function generateCSV(scores) {
  const header = ["Name", "Class", "Score", "Date"];
  const rows = scores.map((score) => [
    score.name,
    score.class,
    score.score,
    new Date(score.date).toLocaleString(),
  ]);
  const csvData = [header, ...rows];
  return csvData.map((row) => row.join(",")).join("\n");
}

// Download CSV file
function downloadCSV(csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quiz_scores.csv";
  link.click();
}

// Initial load of scores when the page is ready
document.addEventListener("DOMContentLoaded", loadScores);
