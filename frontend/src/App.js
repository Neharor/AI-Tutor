import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [subject, setSubject] = useState("math");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [image, setImage] = useState(null);
  const [streaming, setStreaming] = useState(false);

  const handleAskTutor = async () => {
    if (!question && !image) return;

    setResponse(""); // Clear previous response
    setStreaming(true);

    // Send text question to backend
    await axios.post("http://127.0.0.1:5000/chat", { subject, message: question });

    // Stream AI response
    const eventSource = new EventSource(`http://127.0.0.1:5000/stream?subject=${subject}`);
    eventSource.onmessage = (event) => {
      setResponse((prev) => prev + event.data);
    };
    eventSource.onerror = () => {
      eventSource.close();
      setStreaming(false);
    };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    const formData = new FormData();
    formData.append("file", file);

    await axios.post("http://127.0.0.1:5000/upload", formData);
  };

  return (
    <div className="container">
      <h1>AI-Powered Multi-Agent Tutoring</h1>
      
      {/* Subject Selection */}
      <select value={subject} onChange={(e) => setSubject(e.target.value)}>
        <option value="math">Math Tutor</option>
        <option value="science">Science Tutor</option>
        <option value="history">History Tutor</option>
      </select>

      {/* Question Input */}
      <textarea 
        placeholder="Ask your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* Upload Image */}
      <input type="file" accept="image/*" onChange={handleFileUpload} />

      {/* Ask Tutor Button */}
      <button onClick={handleAskTutor} disabled={streaming}>
        {streaming ? "Thinking..." : "Ask Tutor"}
      </button>

      {/* AI Response */}
      <div className="response">
        <h3>Response:</h3>
        <p>{response}</p>
      </div>
    </div>
  );
}

export default App;
