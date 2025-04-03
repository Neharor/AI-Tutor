from flask import request, jsonify

# Dummy student database (In production, use a real database)
students = {
    "123": {
        "name": "Alice",
        "subjects": {"math": 80, "science": 75, "history": 85},
        "feedback": []
    },
    "456": {
        "name": "Bob",
        "subjects": {"math": 65, "science": 70, "history": 78},
        "feedback": []
    }
}

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

def get_student_insights(request):
    """Fetch student insights based on the provided data."""
    data = request.get_json()

    # Extract subject and recent activity
    subject = data.get('subject')
    recent_activity = data.get('recentActivity')

    # For demo purposes, generate some dummy insights based on the subject
    insights = f"Insights for {subject} based on the activity: {recent_activity}"
    
    # Simulate interdisciplinary suggestions
    interdisciplinary_suggestions = "Suggested interdisciplinary connections: Math + Physics, Science + Chemistry."

    return jsonify({
        "insights": insights,
        "interdisciplinarySuggestions": interdisciplinary_suggestions
    })
