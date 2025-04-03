import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./NavBar";
import TutorSession from "./TutorSession/TutorSession";
import StudentCard from "./StudentCard/StudentCard";
import Quiz from "./Quiz/Quiz";
import Home from "./Home/Home";
import Instructor from "./Instructor/Instructor";

function App() {
  // Dummy student data
  const studentData = {
    name: "Alice",
    subject: "math",
    progress: 80,
    recentActivity: "Completed chapter on Algebra",
  };

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/instructor" element={<Instructor></Instructor>} />
        <Route path="/peer-learning" element={<h1>Peer Learning Page</h1>} />
        {/* Pass studentData as a prop to StudentCard */}
        <Route path="/student-card" element={<StudentCard student={studentData} />} />
        <Route path="/quiz" element={<Quiz key={window.location.pathname} />} />
        <Route path="/tutor" element={<TutorSession />} />
      </Routes>
    </Router>
  );
}

export default App;
