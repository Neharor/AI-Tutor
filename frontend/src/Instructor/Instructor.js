import React from 'react';
import './Instructor.css';

const instructors = [
  { subject: "Math", name: "Dr. Alan Turing" },
  { subject: "Science", name: "Dr. Marie Curie" },
  { subject: "History", name: "Prof. Yuval Noah Harari" }
];

const Instructor = () => {
  return (
    <div className="instructor-container">
      <h1>Meet Our Instructors</h1>
      <ul className="instructor-list">
        {instructors.map((instructor, index) => (
          <li key={index} className="instructor-item">
            <h2>{instructor.subject}</h2>
            <p>{instructor.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Instructor;
