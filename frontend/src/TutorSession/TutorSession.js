import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TutorSession.css"; // Import styles

function TutorSession() {
  const [subject, setSubject] = useState("math");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [image, setImage] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const handleAskTutor = async () => {
    if (!question && !image) return;
    setResponse(""); 
    setStreaming(true);

    await axios.post("http://127.0.0.1:5000/chat", { subject, message: question });

    const newEventSource = new EventSource(`http://127.0.0.1:5000/stream?subject=${subject}`);
    setEventSource(newEventSource);

    newEventSource.onmessage = (event) => {
      setResponse((prev) => prev + event.data);
    };
    newEventSource.onerror = () => {
      newEventSource.close();
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
    <div className="tutor-session">
      <h1 className="title">AI-Powered Multi-Agent Tutoring</h1>

      {/* Subject Selection */}
      <label className="label">Select Subject:</label>
      <select className="dropdown" value={subject} onChange={(e) => setSubject(e.target.value)}>
        <option value="math">Math Tutor</option>
        <option value="science">Science Tutor</option>
        <option value="history">History Tutor</option>
      </select>

      {/* Question Input */}
      <textarea 
        className="question-input"
        placeholder="Ask your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* Upload Image */}
      <input type="file" className="file-upload" accept="image/*" onChange={handleFileUpload} />

      {/* Ask Tutor Button */}
      <button className="ask-button" onClick={handleAskTutor} disabled={streaming}>
        {streaming ? "Thinking..." : "Ask Tutor"}
      </button>

      {/* AI Response */}
      <div className="response-container">
        <h3 className="response-title">Response:</h3>
        <p className="response-text">{response}</p>
      </div>
    </div>
  );
}

export default TutorSession;
