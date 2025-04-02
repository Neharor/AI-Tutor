from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services import tutor_session_service  # Import the new service module

# Load API key from .env file
load_dotenv()
import google.generativeai as genai
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend access

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

if __name__ == "__main__":
    app.run(debug=True)
