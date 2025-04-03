import logging
import google.generativeai as genai
from flask import jsonify, request

# AI Model for quiz generation
QUIZ_MODEL = genai.GenerativeModel('gemini-1.5-flash')

# In-memory data storage (replace with DB if needed)
SUBJECTS = ["math", "science", "history", "general"]
quiz_answers = {}  # Store correct answers from AI
quiz_data_storage = {}  # Store quiz data for score calculation

# Set up logging
logging.basicConfig(level=logging.DEBUG)

def get_subjects():
    """Returns a list of available quiz subjects."""
    return jsonify(success=True, subjects=SUBJECTS)

def generate_quiz(request):
    """Generates 5 quiz questions for the selected subject."""
    subject = request.args.get("subject", "general").lower()

    if subject not in SUBJECTS:
        return jsonify(success=False, message=f"Invalid subject. Choose from: {', '.join(SUBJECTS)}")

    prompt = (
        f"Generate 5 multiple-choice quiz questions for {subject} with 4 options each. "
        "The correct answer for each question should be denoted with the letter (A, B, C, or D). "
        "Return the response in the following format:\n\n"
        "START QUIZ\n"
        "Question 1: [question text]\nA) [Option 1]\nB) [Option 2]\nC) [Option 3]\nD) [Option 4]\nAnswer: [correct option letter]\n"
        "Question 2: [question text]\nA) [Option 1]\nB) [Option 2]\nC) [Option 3]\nD) [Option 4]\nAnswer: [correct option letter]\n"
        "Question 3: [question text]\nA) [Option 1]\nB) [Option 2]\nC) [Option 3]\nD) [Option 4]\nAnswer: [correct option letter]\n"
        "Question 4: [question text]\nA) [Option 1]\nB) [Option 2]\nC) [Option 3]\nD) [Option 4]\nAnswer: [correct option letter]\n"
        "Question 5: [question text]\nA) [Option 1]\nB) [Option 2]\nC) [Option 3]\nD) [Option 4]\nAnswer: [correct option letter]\n"
        "END QUIZ\n"
    )

    try:
        # AI response for quiz questions
        response = QUIZ_MODEL.generate_content(prompt)
        
        if not response.text.strip():
            return jsonify(success=False, message="AI did not generate any quiz content.")

        quiz_data, correct_answers = parse_ai_response(response.text)

        if not quiz_data:
            return jsonify(success=False, message="Failed to parse AI's response into quiz format.")

        # Store quiz data and correct answers for future validation
        quiz_data_storage[subject] = quiz_data
        quiz_answers[subject] = correct_answers

        logging.debug(f"Correct answers for {subject}: {quiz_answers[subject]}")  # Log the correct answers

        return jsonify(success=True, quiz=quiz_data)

    except Exception as e:
        logging.error(f"Error generating quiz: {e}")
        return jsonify(success=False, message="An error occurred while generating the quiz.")

def parse_ai_response(response_text):
    """Parses the AI's response and extracts quiz data."""
    try:
        start_marker = "START QUIZ"
        end_marker = "END QUIZ"

        start_index = response_text.find(start_marker)
        end_index = response_text.find(end_marker)

        if start_index == -1 or end_index == -1:
            logging.error("Invalid response format: Missing START QUIZ or END QUIZ markers.")
            return [], []

        quiz_content = response_text[start_index + len(start_marker):end_index].strip()
        quiz_data = []
        correct_answers = []
        questions = quiz_content.split("\n\n")

        for question_block in questions:
            lines = question_block.split("\n")
            if len(lines) < 6:
                continue  # Skip invalid question blocks

            question_text = lines[0].replace("Question", "").strip()
            options = [line.split(")")[1].strip() for line in lines[1:5]]
            answer = lines[5].split(":")[1].strip()  # This is the correct answer option (A, B, C, D)

            quiz_data.append({
                "question": question_text,
                "options": options,
                "answer": answer
            })
            correct_answers.append(answer)  # Store the correct answer option letter

        return quiz_data, correct_answers

    except Exception as e:
        logging.error(f"Error parsing AI response: {e}")
        return [], []

def submit_quiz(request):
    """Validates the user's answer and updates their score."""
    try:
        data = request.get_json()
        subject = data.get("subject")
        answers = data.get("answers")

        if not subject or not answers:
            return jsonify(success=False, message="Subject and answers are required.")

        # Fetch quiz data and correct answers from the stored data
        quiz_data = quiz_data_storage.get(subject)
        correct_answers = quiz_answers.get(subject)

        if not quiz_data or not correct_answers:
            return jsonify(success=False, message="No quiz data found for the selected subject.")

        logging.debug(f"User answers: {answers}")  # Log the user answers
        logging.debug(f"Correct answers: {correct_answers}")  # Log the correct answers

        score = calculate_score(answers, correct_answers, quiz_data)

        logging.debug(f"Calculated score: {score}")  # Log the calculated score

        return jsonify(success=True, score=score)

    except Exception as e:
        logging.error(f"Error submitting quiz: {e}")
        return jsonify(success=False, message="An error occurred while submitting the quiz.")

def calculate_score(answers, correct_answers, quiz_data):
    """Calculates the score based on correct answers."""
    score = 0
    for i, answer in enumerate(answers):
        # Get the correct option based on the letter
        correct_answer_letter = correct_answers[i]
        
        # Find the option text corresponding to the correct letter (A, B, C, or D)
        correct_option_text = quiz_data[i]["options"][ord(correct_answer_letter.upper()) - ord('A')]

        # Log the user answer and correct option text for debugging
        logging.debug(f"Comparing user answer: {answer} with correct option: {correct_option_text}")

        # Compare if the user's answer matches the actual correct option text
        if answer.lower() == correct_option_text.lower():
            score += 1  # Increment score for each correct answer
            
    return score

