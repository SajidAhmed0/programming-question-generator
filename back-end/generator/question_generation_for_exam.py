from .services import generate_programming_question
from .mcq_validator import validate_mcq
from .short_answer_validator import validate_short_answer
from .automatic_validation import validate_mcq_with_llm, validate_short_answer_with_llm
from .coding_validator import validate_coding_sandboxed

from .serializers import ProgrammingQuestionSerializer
from .models import ProgrammingQuestion

def generate_programming_question_for_exam(type, difficulty, user_id, module, exam_id, topic):
    question = generate_programming_question(type, difficulty, user_id, module, topic)

    if question.question_type == 'mcq':
        valid = validate_mcq(question)

        if valid['is_valid']:
            feedback = valid['feedback']
            print(f"{feedback}")
            llm_valid = validate_mcq_with_llm(question)

            if llm_valid['is_valid']:
                feedback = llm_valid['feedback']
                print(f"{feedback}")
                question.validated = True
            else:
                feedback = llm_valid['feedback']
                print(f"{feedback}")
        else:
            feedback = valid['feedback']
            print(f"{feedback}")

    elif question.question_type == 'short-answer':
        valid = validate_short_answer(question)

        if valid['is_valid']:
            feedback = valid['feedback']
            print(f"{feedback}")
            llm_valid = validate_short_answer_with_llm(question)

            if llm_valid['is_valid']:
                feedback = llm_valid['feedback']
                print(f"{feedback}")
                question.validated = True
            else:
                feedback = llm_valid['feedback']
                print(f"{feedback}")
        else:
            feedback = valid['feedback']
            print(f"{feedback}")

    elif question.question_type == 'coding':
        valid = validate_coding_sandboxed(question.code_snippet, question.language)

        if valid['is_valid']:
            feedback = valid['feedback']
            question.validated = True
            print(f"{feedback}")
        else:
            feedback = valid['feedback']
            print(f"{feedback}")
    question.user_id = user_id
    question.exam_id = exam_id

    if question.question_type == 'mcq':
        question.allocated_marks = 1
    elif question.question_type == 'short-answer':
        question.allocated_marks = 3
    elif question.question_type == 'coding':
        question.allocated_marks = 5

    question.save()

    serializer = ProgrammingQuestionSerializer(question)

    return serializer.data