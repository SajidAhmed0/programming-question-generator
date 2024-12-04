def validate_short_answer(question):
    """
    Validates a short-answer question.

    Args:
        question (ProgrammingQuestion): The question.

    Returns:
        dict: Validation result and feedback.
    """

    question_text = question.description
    expected_answers = question.expected_answers

    if not question_text.strip():
        return {"is_valid": False, "feedback": "Question text cannot be empty."}

    if not expected_answers:
        return {"is_valid": False, "feedback": "Expected answers cannot be empty."}

    if len(expected_answers) == 1 and expected_answers[0].strip() == "":
        return {"is_valid": False, "feedback": "Expected answer is blank."}

    return {"is_valid": True, "feedback": "Short-answer question is valid."}