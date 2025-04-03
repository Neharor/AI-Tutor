import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TutorSession.css"; // Import styles

function TutorSession() {
  const [subject, setSubject] = useState("math");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [file, setFile] = useState(null); // Changed from image to file to handle both image and PDF
  const [streaming, setStreaming] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  // Function to handle asking the tutor (including both file and message)
  const handleAskTutor = async () => {
    if (!question && !file) return;
    setResponse(""); 
    setStreaming(true);

    // First send the chat message to the backend to validate and receive initial response
    const res = await axios.post("http://127.0.0.1:5000/chat", { subject, message: question });

    // If the response contains a validation message, display it immediately
    setResponse(res.data.message);

    // Only start streaming if the initial validation passed
    if (res.data.success) {
      const newEventSource = new EventSource(`http://127.0.0.1:5000/stream?subject=${subject}`);
      setEventSource(newEventSource);

      newEventSource.onmessage = (event) => {
        setResponse((prev) => prev + event.data);  // Append streamed data
      };

      newEventSource.onerror = () => {
        newEventSource.close();
        setStreaming(false);
      };
    } else {
      setStreaming(false);  // Stop streaming if the response was invalid
    }
  };

  // Handle file upload (both images and PDFs)
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);  // Store the file (image or PDF)
    const formData = new FormData();
    formData.append("file", uploadedFile);

    // Send the uploaded file to the backend
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

      {/* Upload Image or PDF */}
      <input
        type="file"
        className="file-upload"
        accept="image/*, application/pdf" // Accept both image files and PDFs
        onChange={handleFileUpload}
      />

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
