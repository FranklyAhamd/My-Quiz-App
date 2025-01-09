import { saveScoreToIndexedDB } from "./db.js";

const studentForm = document.getElementById("student-form");
const studentInfoDiv = document.getElementById("student-info");
const quizContainer = document.getElementById("quiz-container");

let currentStudent = {
  name: "",
  class: "",
};

studentForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the page from refreshing
  const studentName = document.getElementById("student-name").value;
  const studentClass = document.getElementById("student-class").value;
  const questionTime = parseInt(document.getElementById("question-time").value); // Get selected question time

  if (!studentName || !studentClass) {
    alert("Please fill in all fields!");
    return;
  }

  // Save the current student's details
  currentStudent.name = studentName;
  currentStudent.class = studentClass;

  // Hide the form and show the quiz
  studentInfoDiv.style.display = "none";
  quizContainer.style.display = "block";

  startQuiz(questionTime);
});

function startQuiz(questionTime) {
  // Fetch questions from localStorage (use fallback if no questions available)
  const allQuestions = JSON.parse(localStorage.getItem("questions")) || [];
  if (allQuestions.length === 0) {
    alert("No questions available. Please add questions first.");
    return;
  }

  // Shuffle and select a subset of questions (limit to 10 questions)
  const shuffledQuestions = allQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 40);

  let currentQuestionIndex = 0;
  let score = 0;
  let timer;
  let timeLeft;

  const scoreElement = document.getElementById("score");
  const timerElement = document.getElementById("timer");
  const questionCounterElement = document.getElementById("question-counter");
  const questionElement = document.querySelector(".question");
  const optionsContainer = document.querySelector(".quiz_options");
  const nextButton = document.getElementById("next-button");

  function loadQuestion() {
    resetState();

    const question = shuffledQuestions[currentQuestionIndex];
    questionElement.innerText = question.question;

    question.options.forEach((option, index) => {
      const optionContainer = document.createElement("div");
      optionContainer.classList.add("option");

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "option";
      radio.id = `option_${index}`;
      radio.value = index;

      const label = document.createElement("label");
      label.htmlFor = `option_${index}`;
      label.innerHTML = `<span style="text-transform: uppercase; font-weight: bold;" class="option_label">${String.fromCharCode(
        97 + index
      )}:</span> ${option}`;

      radio.addEventListener("change", () => {
        nextButton.disabled = false;
        if (parseInt(radio.value) === question.answer) {
          score++;
        }
      });

      optionContainer.appendChild(radio);
      optionContainer.appendChild(label);
      optionsContainer.appendChild(optionContainer);
    });

    questionCounterElement.innerText = `Question ${
      currentQuestionIndex + 1
    } of 40`;

    timeLeft = questionTime; // Set time for the current question
    startTimer();
  }

  function resetState() {
    clearInterval(timer);
    nextButton.disabled = true;
    optionsContainer.innerHTML = "";
    timerElement.style.width = "100%";
    timerElement.style.backgroundColor = ""; // Reset timer color
  }

  function startTimer() {
    timerElement.style.width = "100%";
    timerElement.style.transition = "none"; // Disable previous transitions for reset
    timerElement.style.backgroundColor = "green"; // Reset color at the start

    const interval = 100; // Update every 100ms
    const totalIntervals = questionTime * (1000 / interval); // Total number of intervals
    let currentInterval = 0;

    timer = setInterval(() => {
      currentInterval++;
      const timeFraction = currentInterval / totalIntervals;
      timeLeft = Math.ceil(questionTime - timeFraction * questionTime);

      // Update the width of the bar
      timerElement.style.transition = "width 0.1s linear"; // Smooth transition for each update
      timerElement.style.width = `${(1 - timeFraction) * 100}%`;

      // Update color based on remaining time
      if (timeLeft <= Math.floor(0.7 * questionTime)) {
        timerElement.style.backgroundColor = "yellow";
      }
      if (timeLeft <= Math.floor(0.2 * questionTime)) {
        timerElement.style.backgroundColor = "red";
      }

      document.getElementById("time-left").textContent = timeLeft;

      // Stop the timer when it finishes
      if (currentInterval >= totalIntervals) {
        clearInterval(timer);
        nextQuestion();
      }
    }, interval);
  }

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < shuffledQuestions.length) {
      loadQuestion();
    } else {
      endQuiz();
    }
  }

  function endQuiz() {
    questionElement.innerText = `Quiz Over! Final Score: ${score} out of 40`;
    optionsContainer.innerHTML = "";
    nextButton.style.display = "none";
    clearInterval(timer);
    timerElement.style.width = "0";

    saveScoreToIndexedDB(currentStudent, score);
    document.getElementById("time-left-parent").textContent = "";
    document.getElementById("submit-button").style.display = "block";
  }

  scoreElement.innerText = `Score: ${score}`;
  loadQuestion();

  nextButton.addEventListener("click", () => {
    nextQuestion();
    scoreElement.innerText = `Score: ${score}`;
  });
}
