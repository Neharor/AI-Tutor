from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services import tutor_session_service  # AI Tutoring
from services import quiz_service  # Quiz System
from services import student_card_service  # Student Card Service
import google.generativeai as genai

# Load API key from .env file
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend access

# === AI Model for Answer Validation ===
AI_VALIDATOR = genai.GenerativeModel('gemini-1.5-flash')

# In-memory storage for Peer Learning (Replace with a database in production)
peer_questions = []

# === Tutor Session Routes ===
@app.route("/upload", methods=["POST"])
def upload():
    return tutor_session_service.upload_file(request)

@app.route("/chat", methods=["POST"])
def chat():
    return tutor_session_service.chat(request)

@app.route("/stream", methods=["GET"])
def stream():
    return tutor_session_service.stream(request)

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Tutoring system is running"})

# === Student Card Routes ===
@app.route("/student/<student_id>", methods=["GET"])
def get_student(student_id):
    return student_card_service.get_student(student_id)

@app.route("/student/<student_id>/feedback", methods=["POST"])
def add_feedback(student_id):
    return student_card_service.add_feedback(student_id, request)

@app.route("/student/<student_id>/progress", methods=["GET"])
def get_student_progress():
    return student_card_service.get_progress(request)

@app.route("/api/student-insights", methods=["POST"])
def student_insights():
    return student_card_service.get_student_insights(request)

# === Quiz Routes ===
@app.route("/quiz/subjects", methods=["GET"])
def get_subjects():
    return quiz_service.get_subjects()

@app.route("/quiz", methods=["GET"])
def generate_quiz():
    return quiz_service.generate_quiz(request)

@app.route("/quiz/submit", methods=["POST"])
def submit_quiz():
    return quiz_service.submit_quiz(request)

@app.route("/quiz/stream_feedback", methods=["POST"])
def stream_feedback():
    return quiz_service.stream_feedback(request)

@app.route("/quiz/progress", methods=["GET"])
def get_quiz_progress():
    return quiz_service.get_progress()

@app.route("/quiz/leaderboard", methods=["GET"])
def get_leaderboard():
    return quiz_service.get_leaderboard()

@app.route("/quiz/badges", methods=["GET"])
def get_badges():
    return quiz_service.get_badges()

@app.route("/quiz/retry", methods=["POST"])
def retry_quiz():
    return quiz_service.retry_quiz(request)

# === Peer Learning Routes ===
@app.route('/ask_question', methods=['POST'])
def ask_question():
    """Students can post questions"""
    data = request.json
    question = data.get("question", "").strip()
    student_name = data.get("student_name", "Anonymous")

    if not question:
        return jsonify(success=False, message="Question cannot be empty")

    question_entry = {
        "question": question,
        "student": student_name,
        "answers": []
    }
    
    peer_questions.append(question_entry)
    return jsonify(success=True, message="Question posted successfully")

@app.route('/answer_question', methods=['POST'])
def answer_question():
    """Students can answer posted questions"""
    data = request.json
    question_text = data.get("question", "").strip()
    answer = data.get("answer", "").strip()
    student_name = data.get("student_name", "Anonymous")

    if not question_text or not answer:
        return jsonify(success=False, message="Both question and answer are required")

    for question_entry in peer_questions:
        if question_entry["question"] == question_text:
            # AI validation of the answer
            ai_feedback = AI_VALIDATOR.generate_content(
                f"Validate Provide your answer: {answer}"
            )
            validated_answer = {
                "student": student_name,
                "answer": answer,
                "ai_feedback": ai_feedback.text
            }
            question_entry["answers"].append(validated_answer)
            return jsonify(success=True, message="Answer submitted successfully with AI feedback")

    return jsonify(success=False, message="Question not found")

@app.route('/get_questions', methods=['GET'])
def get_questions():
    """Fetch all posted questions with answers"""
    return jsonify(success=True, questions=peer_questions)

if __name__ == "__main__":
    app.run(debug=True)
