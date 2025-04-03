from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services import tutor_session_service  # AI Tutoring
from services import quiz_service  # Quiz System
from services import student_card_service  # Import Student Card Service

# Load API key from .env file
load_dotenv()
import google.generativeai as genai
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend access

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
def get_student(student_id):  # Fixed missing parameter
    return student_card_service.get_student(student_id)  # Pass it correctly

@app.route("/student/<student_id>/feedback", methods=["POST"])
def add_feedback(student_id):  # Fixed missing parameter
    return student_card_service.add_feedback(student_id, request)

@app.route("/student/<student_id>/progress", methods=["GET"])
def get_student_progress():  # Renamed to avoid conflict
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
def get_quiz_progress():  # Renamed to avoid conflict
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

if __name__ == "__main__":
    app.run(debug=True)
