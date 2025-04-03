from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services import tutor_session_service  # Import the tutor session service module
from services import quiz_service  # Import the quiz service module

# Load API key from .env file
load_dotenv()
import google.generativeai as genai
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend access

# Routes for Tutor Session
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

# Routes for Quiz
@app.route("/quiz/subjects", methods=["GET"])
def get_subjects():
    """Returns a list of available quiz subjects."""
    return quiz_service.get_subjects()

@app.route("/quiz", methods=["GET"])
def generate_quiz():
    """Generates 5 quiz questions for the selected subject."""
    return quiz_service.generate_quiz(request)

@app.route("/quiz/submit", methods=["POST"])
def submit_quiz():
    """Validates a user's answer and updates their score."""
    return quiz_service.submit_quiz(request)

@app.route("/quiz/stream_feedback", methods=["POST"])
def stream_feedback():
    """Streams AI-generated detailed feedback on the answer."""
    return quiz_service.stream_feedback(request)

@app.route("/quiz/progress", methods=["GET"])
def get_progress():
    """Returns the user's quiz progress, including score and number of quizzes attempted."""
    return quiz_service.get_progress()

@app.route("/quiz/leaderboard", methods=["GET"])
def get_leaderboard():
    """Returns the leaderboard of top players."""
    return quiz_service.get_leaderboard()

@app.route("/quiz/badges", methods=["GET"])
def get_badges():
    """Returns the badges earned by the user based on their quiz progress."""
    return quiz_service.get_badges()

@app.route("/quiz/retry", methods=["POST"])
def retry_quiz():
    """Allows the user to retry the quiz for a selected subject."""
    return quiz_service.retry_quiz(request)

if __name__ == "__main__":
    app.run(debug=True)
