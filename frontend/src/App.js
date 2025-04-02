import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./NavBar";
import TutorSession from "./TutorSession/TutorSession";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/instructor" element={<h1>Instructor Page</h1>} />
        <Route path="/peer-learning" element={<h1>Peer Learning Page</h1>} />
        <Route path="/quiz" element={<h1>Quiz Page</h1>} />
        <Route path="/student-card" element={<h1>Student Card Page</h1>} />
        <Route path="/tutor" element={<TutorSession />} />
      </Routes>
    </Router>
  );
}

export default App;
