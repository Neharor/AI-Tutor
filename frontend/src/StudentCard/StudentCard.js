import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentCard.css"; // Import styles

const StudentCard = ({ student }) => {
  const [subject, setSubject] = useState(student.subject || "math");
  const [progress, setProgress] = useState(student.progress || 0);
  const [insights, setInsights] = useState("");
  const [interdisciplinarySuggestions, setInterdisciplinarySuggestions] = useState("");
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    fetchInsights(student.subject, student.recentActivity); // Fetch insights on initial render
  }, [student]);

  const fetchInsights = async (subject, recentActivity) => {
    try {
      setStreaming(true); // Set streaming state to true while processing
      const response = await axios.post("http://127.0.0.1:5000/api/student-insights", {
        subject,
        recentActivity, // Send recent activity as message to AI
      });

      setInsights(response.data.insights || "No insights available");
      setInterdisciplinarySuggestions(response.data.interdisciplinarySuggestions || "No suggestions available");
      setStreaming(false); // Set streaming state to false once done
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsights("Error fetching insights.");
      setStreaming(false); // Reset streaming state if there's an error
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
          fetchInsights(e.target.value, student.recentActivity); // Fetch new insights on subject change
        }}
      >
        <option value="math">Math Tutor</option>
        <option value="science">Science Tutor</option>
        <option value="history">History Tutor</option>
      </select>

      {/* Progress */}
      <div className="student-progress">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <p><strong>Progress:</strong> {progress}%</p>

      {/* Insights and Interdisciplinary Suggestions */}
      <div className="insights-container">
        <h3>AI Insights:</h3>
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
