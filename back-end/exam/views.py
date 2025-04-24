from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from .serializers import ExamSerializer
from .models import Exam

from generator.question_generation_for_exam import generate_programming_question_for_exam

from concurrent.futures import ThreadPoolExecutor

class ExamView(APIView):
    def get(self, request, user_id):

        exams = Exam.objects.all()
        serializer = ExamSerializer(exams, many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def post(self, request, user_id):
        body = request.data

        module = body.get('module')

        exam = Exam(module=module, user_id=user_id, status=False)

        exam.save()

        questions = generate_all_questions(difficulty='easy', user_id=user_id, module=module, exam_id=exam.id)

        total_marks = 0

        for question in questions:
            total_marks += question["allocated_marks"]
            question.exam_id = exam.id

        exam.total_marks = total_marks

        exam.save()

        serializer = ExamSerializer(exam)

        return Response(data={"exam": serializer.data, "questions": questions}, status=status.HTTP_200_OK)

def generate_all_questions(difficulty, module, user_id, exam_id):
    tasks = (
        ["mcq"] * 6 +
        ["short-answer"] * 3 +
        ["coding"]
    )

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(safe_generate, qtype, difficulty, user_id, module, exam_id)
            for qtype in tasks
        ]
        return [f.result() for f in futures]

def safe_generate(qtype, difficulty, user_id, module, exam_id, retries=3):
    for _ in range(retries):
        try:
            return generate_programming_question_for_exam(qtype, difficulty, user_id, module, exam_id)
        except Exception as e:
            continue
    return {"error": f"Failed to generate {qtype} question"}


class ExamAnswerView(APIView):
    def get(self, request, user_id, exam_id):

        exams = Exam.objects.all()
        serializer = ExamSerializer(exams, many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def post(self, request, user_id, exam_id):
        body = request.data

        module = body.get('module')