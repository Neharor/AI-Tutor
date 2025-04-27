import React, { useEffect, useState } from "react";
import "./PeerLearning.css";

const PeerLearning = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState({ question: "", answer: "" });

  // Fetch questions from backend
  const fetchQuestions = () => {
    fetch("http://localhost:5000/get_questions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuestions(data.questions);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Post a new question
  const askQuestion = () => {
    fetch("http://localhost:5000/ask_question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQuestion, student_name: "Student1" }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewQuestion("");
        fetchQuestions();
      });
  };

  // Answer an existing question
  const answerQuestion = (questionText) => {
    fetch("http://localhost:5000/answer_question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        question: questionText, 
        answer: newAnswer.answer, 
        student_name: "Student2" 
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewAnswer({ question: "", answer: "" });
        fetchQuestions();
      });
  };

  return (
    <div className="peer-learning-container">
      <h1>Peer Learning</h1>

      {/* Ask a Question Section */}
      <div className="ask-section">
        <input
          type="text"
          placeholder="Ask a question..."
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <button onClick={askQuestion}>Ask</button>
      </div>

      {/* List of Questions */}
      <div className="questions-section">
        {questions.map((q, index) => (
          <div key={index} className="question-card">
            <p><strong>{q.student} asked:</strong> {q.question}</p>
            <div className="answers">
              {q.answers.map((a, i) => (
                <div key={i} className="answer">
                  <p><strong>{a.student} answered:</strong> {a.answer}</p>
                  <p><em>AI Feedback: {a.ai_feedback}</em></p>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Write an answer..."
              value={newAnswer.question === q.question ? newAnswer.answer : ""}
              onChange={(e) => setNewAnswer({ question: q.question, answer: e.target.value })}
            />
            <button onClick={() => answerQuestion(q.question)}>Answer</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeerLearning;
