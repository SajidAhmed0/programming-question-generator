def validate_mcq(question_text, options, correct_option):
    """
    Validates an MCQ question.

    Args:
        question_text (str): The question text.
        options (list): A list of answer options.
        correct_option (str): The correct answer.

    Returns:
        dict: Validation result and feedback.
    """
    if not question_text.strip():
        return {"is_valid": False, "feedback": "Question text cannot be empty."}

    if len(options) < 2:
        return {"is_valid": False, "feedback": "At least two options are required."}

    if correct_option not in options:
        return {"is_valid": False, "feedback": "The correct option is not in the options list."}

    # Check for ambiguous options
    if len(set(options)) != len(options):
        return {"is_valid": False, "feedback": "Duplicate options detected."}

    # Ensure the question is logically valid
    # Example: Use GPT or heuristic rules to validate (optional)
    # result = openai.ChatCompletion.create(...)

    return {"is_valid": True, "feedback": "MCQ is valid."}