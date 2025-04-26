
from .evaluate_question_answer import evaluate_question_answer

from .serializers import ProgrammingQuestionSerializer
from .models import ProgrammingQuestion


def validate_answer_question_for_exam(answer_question):
    question_id = answer_question['id']
    stored_question = ProgrammingQuestion.objects.filter(id=question_id).first()

    if not stored_question:
        # Need to change the return value
        return {"error": "Question is not found for this exam"}

    is_answered = answer_question['answered']

    if is_answered:

        result = evaluate_question_answer(answer_question=answer_question)

        stored_question.answer_feedback = result["feedback"]
        stored_question.is_correct = result["is_correct"]
        stored_question.answered = is_answered
        stored_question.student_marks = result["marks"]
        stored_question.student_answer = answer_question["student_answer"]

        stored_question.save()

        serializer = ProgrammingQuestionSerializer(stored_question)

        return serializer.data

    else:
        # Need to change the return value
        return {"error: Questions should be answered"}