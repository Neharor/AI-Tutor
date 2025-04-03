from flask import Flask, request, jsonify
import google.generativeai as genai

app = Flask(__name__)

# AI Model for Validation
AI_VALIDATOR = genai.GenerativeModel('gemini-1.5-flash')

# In-memory storage (Replace with a database in production)
peer_questions = []

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
                f"Validate the following answer and provide improvement suggestions: {answer}"
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

if __name__ == '__main__':
    app.run(debug=True)
