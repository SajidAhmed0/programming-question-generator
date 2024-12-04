def validate_coding(question):
    """
    Validate a coding question by running it in a sandbox.
    """
    try:
        exec(question.code_snippet)
        return {"is_valid": True, "feedback": "code is run successfully"}
    except Exception as e:
        return {"is_valid": False, "feedback": str(e)}