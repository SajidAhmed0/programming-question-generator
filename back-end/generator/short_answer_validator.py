def validate_short_answer(question_text, expected_answers):
    """
    Validates a short-answer question.

    Args:
        question_text (str): The question text.
        expected_answers (list): A list of acceptable correct answers.

    Returns:
        dict: Validation result and feedback.
    """
    if not question_text.strip():
        return {"is_valid": False, "feedback": "Question text cannot be empty."}

    if not expected_answers:
        return {"is_valid": False, "feedback": "Expected answers cannot be empty."}

    if len(expected_answers) == 1 and expected_answers[0].strip() == "":
        return {"is_valid": False, "feedback": "Expected answer is blank."}

    # Check for ambiguity in expected answers
    if len(set(expected_answers)) != len(expected_answers):
        return {"is_valid": False, "feedback": "Duplicate expected answers detected."}

    return {"is_valid": True, "feedback": "Short-answer question is valid."}