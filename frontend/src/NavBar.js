import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  return (
    <nav className="navbar">
      <h2 className="logo">AI Tutor</h2>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/instructor">Instructor</Link></li>
        <li><Link to="/peer-learning">Peer Learning</Link></li>
        <li><Link to="/quiz">Quiz</Link></li>
        <li><Link to="/student-card">Student Card</Link></li>
        <li><Link to="/tutor">Tutor</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;
