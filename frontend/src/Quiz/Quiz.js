import React, { useState, useEffect, useCallback } from "react";
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

  // Use useCallback to ensure that fetchQuizQuestions is stable
  const fetchQuizQuestions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5000/quiz?subject=${subject}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.quiz) && data.quiz.length > 0) {
        setQuizQuestions(data.quiz);
        setUserAnswers(new Array(data.quiz.length).fill(""));
        setShowSubjectSelection(false); // Hide subject selection once quiz starts
      } else {
        setError("Failed to load quiz questions.");
      }
    } catch (error) {
      setError("An error occurred while fetching quiz questions.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [subject]); // Dependency on 'subject' so it updates when subject changes

  useEffect(() => {
    setIsQuizStarted(false);
    setIsQuizCompleted(false);
    setShowSubjectSelection(true);
    setQuizQuestions([]);
    setUserAnswers([]);
    setError("");
  }, [location.pathname]);

  useEffect(() => {
    if (isQuizStarted) {
      fetchQuizQuestions();
    }
  }, [isQuizStarted, fetchQuizQuestions]); // Add 'fetchQuizQuestions' as a dependency

  const handleAnswerChange = (index, answer) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = answer;
    setUserAnswers(updatedAnswers);
  };

  const submitQuiz = async () => {
    if (userAnswers.includes("") || userAnswers.length !== quizQuestions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, answers: userAnswers }),
      });

      const data = await response.json();

      if (data.success) {
        setScore(data.score);
        setIsQuizCompleted(true);
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

  const startQuiz = () => {
    setIsQuizStarted(true);
    setShowSubjectSelection(false);
  };

  const startNewQuiz = () => {
    setIsQuizStarted(false);
    setIsQuizCompleted(false);
    setShowSubjectSelection(true);
    setQuizQuestions([]);
    setUserAnswers([]);
    setError("");
  };

  return (
    <div className="quiz-container">
      <h1>Test Your Knowledge</h1>

      {showSubjectSelection && !isQuizStarted && (
        <div className="subject-selection">
          <label>Select Subject:</label>
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value); // Ensure subject change triggers state updates
              setIsQuizStarted(false); // Reset the quiz start state
              setQuizQuestions([]); // Reset the quiz questions
              setUserAnswers([]); // Reset the user's answers
            }}
          >
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="general">General</option>
          </select>
          <button className="start-button" onClick={startQuiz}>
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
        </div>
      )}
    </div>
  );
};

export default Quiz;
