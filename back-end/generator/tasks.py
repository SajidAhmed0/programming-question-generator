from .models import ProgrammingQuestion
from .sandbox import validate_code

def validate_questions():
    unvalidated_questions = ProgrammingQuestion.objects.filter(validated=False)

    for question in unvalidated_questions:
        is_valid, actual_output = validate_code(
            language=question.language,
            code=question.code_snippet,
            test_input="",  # Add test inputs if needed
            expected_output=question.expected_output
        )
        question.validated = is_valid
        question.save()
