document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("question-form");
  const questionsList = document.getElementById("questions-list");
  const storedQuestions = JSON.parse(localStorage.getItem("questions")) || [];
  const searchBar = document.getElementById("search-bar");

  // Render existing questions
  function renderQuestions(questions = storedQuestions) {
    questionsList.innerHTML = questions
      .map(
        (q, index) =>
          `<tr>
                <td>${index + 1}</td> <!-- Row number -->
                <td>${q.question}</td>
                <td>${q.options[0]}</td>
                <td>${q.options[1]}</td>
                <td>${q.options[2]}</td>
                <td>${q.options[3]}</td>
                <td>${q.options[q.answer]}</td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td> <!-- Delete button -->
              </tr>`
      )
      .join("");
  }

  renderQuestions();

  // Add question to localStorage
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const question = document.getElementById("question").value;
    const options = [
      document.getElementById("option1").value,
      document.getElementById("option2").value,
      document.getElementById("option3").value,
      document.getElementById("option4").value,
    ];
    const answer = parseInt(document.getElementById("answer").value);

    storedQuestions.push({ question, options, answer });
    localStorage.setItem("questions", JSON.stringify(storedQuestions));
    form.reset();
    renderQuestions();
  });

  // Delete a question
  questionsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.getAttribute("data-index");
      storedQuestions.splice(index, 1); // Remove the question from array
      localStorage.setItem("questions", JSON.stringify(storedQuestions)); // Update localStorage
      renderQuestions(); // Re-render the list
    }
  });

  // Search functionality
  searchBar.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredQuestions = storedQuestions.filter((q) =>
      q.question.toLowerCase().includes(searchTerm)
    );
    renderQuestions(filteredQuestions); // Render filtered questions
  });
});
