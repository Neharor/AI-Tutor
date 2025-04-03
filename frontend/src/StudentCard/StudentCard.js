import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentCard.css"; // Import styles

const StudentCard = () => {
  // Dummy student data (this would normally come from the backend)
  const student = {
    id: "123",
    name: "Alice",
    subject: "math",
    progress: 80,
    recentActivity: "Completed chapter on Algebra and History is still pending, Science is in progress"
  };

  const [subject, setSubject] = useState(student.subject || "math");
  const [progress, setProgress] = useState(student.progress || 0);
  const [insights, setInsights] = useState("");
  const [interdisciplinarySuggestions, setInterdisciplinarySuggestions] = useState("");
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    if (student.recentActivity) {
      //fetchInsights(subject, student.recentActivity);
    }
  }, [student]);

  const fetchInsights = async (subject, recentActivity) => {
    try {
      setStreaming(true);
      const response = await axios.post("http://127.0.0.1:5000/api/student-insights", {
        studentId: student.id,
        subject,            // The selected subject
        recentActivity,     // The recent activity
      });

      setInsights(response.data.aiFeedback || "No insights available");
      setInterdisciplinarySuggestions(response.data.interdisciplinarySuggestions || "No suggestions available");
      setStreaming(false);
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsights("Error fetching insights.");
      setStreaming(false);
    }
  };

  return (
    <div className="student-card">
      <h2>{student.name}</h2>

      {/* Subject Selection */}
      <label className="label">Select Subject:</label>
      <select
        className="dropdown"
        value={subject}
        onChange={(e) => {
          setSubject(e.target.value);
          fetchInsights(e.target.value, student.recentActivity);  // Fetch insights with selected subject
        }}
      >
        <option value="math">Math</option>
        <option value="science">Science</option>
        <option value="history">History</option>
      </select>

      {/* Progress */}
      <div className="student-progress">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <p><strong>Progress:</strong> {progress}%</p>

      {/* Insights and Interdisciplinary Suggestions */}
      <div className="insights-container">
        <h3>AI Feedback:</h3>
        <p>{insights}</p>
        <h3>Interdisciplinary Suggestions:</h3>
        <p>{interdisciplinarySuggestions}</p>
      </div>

      {/* Refresh Insights Button */}
      <button
        className="ask-button"
        onClick={() => fetchInsights(subject, student.recentActivity)}
        disabled={streaming}
      >
        {streaming ? "Thinking..." : "Refresh Insights"}
      </button>

      {/* Streaming Response */}
      {streaming && (
        <div className="streaming-container">
          <p>Streaming response...</p>
        </div>
      )}
    </div>
  );
};

export default StudentCard;
