import google.generativeai as genai
from flask import Response, stream_with_context, jsonify
import io
from PIL import Image
from werkzeug.utils import secure_filename

# Multi-agent tutors
TUTORS = {
    "math": genai.GenerativeModel('gemini-1.5-flash'),
    "science": genai.GenerativeModel('gemini-1.5-flash'),
    "history": genai.GenerativeModel('gemini-1.5-flash'),
    "general": genai.GenerativeModel('gemini-1.5-flash')
}

chat_sessions = {subject: TUTORS[subject].start_chat(history=[]) for subject in TUTORS}
next_message = {}
next_image = {}

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}


def allowed_file(filename):
    """Checks if the file has an allowed extension"""
    return filename.rsplit('.', 1)[-1].lower() in ALLOWED_EXTENSIONS


def upload_file(request):
    """Handles file upload for multimodal AI tutoring"""
    global next_image

    if "file" not in request.files:
        return jsonify(success=False, message="No file uploaded")

    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify(success=False, message="Invalid file")

    filename = secure_filename(file.filename)

    # Read the file into a PIL image
    file_stream = io.BytesIO(file.read())
    next_image = Image.open(file_stream)

    return jsonify(success=True, message="File uploaded", filename=filename)


def classify_subject(question):
    """Uses AI to determine the subject of a question."""
    classification_model = genai.GenerativeModel("gemini-1.5-flash")
    response = classification_model.generate_content(
        f"Classify this question into one of the following subjects: Math, Science, or History. "
        f"Only return the subject name: {question}"
    )
    return response.text.strip().lower()


def chat(request):
    """Handles chat interaction with subject-specific AI tutors"""
    global next_message
    data = request.json
    subject = data.get("subject", "general").lower()
    message = data.get("message", "")

    if subject not in TUTORS:
        return jsonify(success=False, message="Invalid subject")

    predicted_subject = classify_subject(message)  # AI classifier

    if predicted_subject != subject:
        return jsonify(success=False, message=f"This question belongs to the {predicted_subject.capitalize()} tutor. Please switch subjects.")

    next_message[subject] = message
    return jsonify(success=True)


def stream(request):
    """Streams AI-generated tutoring responses"""
    def generate():
        global next_message, next_image
        subject = request.args.get("subject", "general").lower()

        if subject not in chat_sessions:
            yield f"data: Invalid subject\n\n"
            return

        session = chat_sessions[subject]
        user_message = next_message.get(subject, "")
        assistant_response_content = ""

        if next_image:
            response = session.send_message([user_message, next_image], stream=True)
            next_image = None
        else:
            response = session.send_message(user_message, stream=True)

        next_message[subject] = ""  # Clear message

        for chunk in response:
            assistant_response_content += chunk.text
            yield f"data: {chunk.text}\n\n"

    return Response(stream_with_context(generate()), mimetype="text/event-stream")
