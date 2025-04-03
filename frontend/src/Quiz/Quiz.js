import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Quiz.css";

const Quiz = () => {
  const [subject, setSubject] = useState("math");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSubjectSelection, setShowSubjectSelection] = useState(true);

  const location = useLocation();

  // Reset quiz when user navigates to the Quiz page
  useEffect(() => {
    setIsQuizStarted(false);
    setIsQuizCompleted(false);
    setShowSubjectSelection(true);
    setQuizQuestions([]); // Ensure fresh state
    setUserAnswers([]);
  }, [location.pathname]); // This will reset on every navigation

  useEffect(() => {
    if (isQuizStarted) {
      fetchQuizQuestions();
    }
  }, [subject, isQuizStarted]);

  const fetchQuizQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/quiz?subject=${subject}`);
      const data = await response.json();

      if (data.success) {
        setQuizQuestions(data.quiz);
        setUserAnswers(new Array(data.quiz.length).fill(""));
        setError("");
      } else {
        setError("Failed to load quiz questions.");
      }
    } catch (error) {
      setError("An error occurred while fetching quiz questions.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, answer) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = answer;
    setUserAnswers(updatedAnswers);
  };

  const submitQuiz = async () => {
    if (userAnswers.includes("")) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, answers: userAnswers }),
      });

      const data = await response.json();

      if (data.success) {
        setScore(data.score);  // Correctly use score here
        setIsQuizCompleted(true);
        setShowSubjectSelection(false);
      } else {
        setError(data.message || "Error submitting quiz.");
      }
    } catch (error) {
      setError("An error occurred while submitting the quiz.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startNewQuiz = () => {
    // Reset quiz state to show fresh start
    setIsQuizStarted(false);
    setIsQuizCompleted(false);
    setShowSubjectSelection(true);
    setQuizQuestions([]); // Clear previous questions
    setUserAnswers([]); // Clear previous answers
  };

  const goBackToSubjects = () => {
    // Reset quiz state to show fresh start
    setIsQuizStarted(false);
    setIsQuizCompleted(false);
    setShowSubjectSelection(true);
    setQuizQuestions([]); // Clear previous questions
    setUserAnswers([]); // Clear previous answers
  };

  return (
    <div className="quiz-container">
      <h1>Test Your Knowledge</h1>

      {showSubjectSelection && (
        <div className="subject-selection">
          <label>Select Subject:</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="general">General</option>
          </select>
          <button className="start-button" onClick={() => setIsQuizStarted(true)}>
            Start Quiz
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading quiz...</div>}

      {error && <div className="error">{error}</div>}

      {quizQuestions.length > 0 && isQuizStarted && !isQuizCompleted && (
        <div className="quiz-form">
          <form>
            {quizQuestions.map((question, index) => (
              <div key={index} className="question-block">
                <h3>{question.question}</h3>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="option">
                    <input
                      type="radio"
                      name={`question${index}`}
                      value={option}
                      checked={userAnswers[index] === option}
                      onChange={() => handleAnswerChange(index, option)}
                    />
                    <label>{option}</label>
                  </div>
                ))}
              </div>
            ))}
          </form>
          <button onClick={submitQuiz} className="submit-button">
            Submit Quiz
          </button>
        </div>
      )}

      {isQuizCompleted && (
        <div className="quiz-completed">
          <h3>Quiz Completed!</h3>
          <p>Your score is: {score}</p>
          <p>Thank you for participating!</p>
          <button onClick={startNewQuiz} className="retry-button">
            Retake Quiz
          </button>
          <button onClick={goBackToSubjects} className="back-button">
            Back to Subjects
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
