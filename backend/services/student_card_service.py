from flask import request, jsonify
import google.generativeai as genai
import os

# Dummy student database (Replace with a real database in production)
students = {
    "123": {
        "studentId": "123",
        "name": "Alice",
        "subjects": {
            "math": 80,
            "science": 75,
            "history": 85
        },
        "feedback": [
            {
                "subject": "math",
                "comment": "Great progress in algebra!",
                "timestamp": "2025-04-01T10:00:00Z"
            },
            {
                "subject": "science",
                "comment": "Needs more practice with experiments.",
                "timestamp": "2025-04-02T14:00:00Z"
            }
        ],
        "recentActivity": "Completed algebra problems",
        "lastUpdated": "2025-04-03T09:00:00Z"
    }
}

# Configure Gemini AI
AI_MODEL = genai.GenerativeModel('gemini-1.5-flash')

def get_student(student_id):
    """Fetch student details."""
    student = students.get(student_id)
    if student:
        return jsonify(student)
    return jsonify({"error": "Student not found"}), 404

def add_feedback(student_id, request):
    """Add feedback for a student."""
    student = students.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    feedback = request.json.get("feedback", "")
    if not feedback:
        return jsonify({"error": "Feedback cannot be empty"}), 400

    student["feedback"].append(feedback)
    return jsonify({"success": True, "message": "Feedback added"})

def get_progress(student_id):
    """Retrieve a student's academic progress."""
    student = students.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({"name": student["name"], "progress": student["subjects"]})

def get_gemini_feedback(student, subject, recent_activity):
    """Generate AI feedback based on student performance and activity."""
    prompt = f"""
    The student {student['name']} has been learning {subject}. 
    Their recent activity: {recent_activity}.
    Current scores: {student['subjects']} in subjects.
    Provide personalized feedback and improvement suggestions.
    """
    try:
        response = AI_MODEL.generate_content(prompt)
        return response.text if response else "No AI feedback available."
    except Exception as e:
        return f"Error fetching feedback: {str(e)}"

def get_interdisciplinary_suggestions(subject, recent_activity):
    """Generate interdisciplinary suggestions dynamically using Gemini AI."""
    prompt = f"""
    The student is learning {subject} and recently engaged in {recent_activity}. 
    Suggest relevant interdisciplinary connections to enhance their learning.
    """
    try:
        response = AI_MODEL.generate_content(prompt)
        return response.text if response else "No interdisciplinary insights available."
    except Exception as e:
        return f"Error fetching suggestions: {str(e)}"

def get_student_insights(request):
    """Fetch AI-generated student insights, feedback, and interdisciplinary suggestions."""
    data = request.get_json()

    print("Received Data:", data)  # Debugging

    student_id = str(data.get('studentId'))
    subject = data.get('subject')
    recent_activity = data.get('recentActivity')

    if not student_id or not subject or not recent_activity:
        return jsonify({"error": "Student ID, subject, and recent activity are required"}), 400

    student = students.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    # Get AI-generated feedback and interdisciplinary suggestions
    ai_feedback = get_gemini_feedback(student, subject, recent_activity)
    interdisciplinary_suggestions = get_interdisciplinary_suggestions(subject, recent_activity)

    return jsonify({
        "aiFeedback": ai_feedback,
        "interdisciplinarySuggestions": interdisciplinary_suggestions
    })
