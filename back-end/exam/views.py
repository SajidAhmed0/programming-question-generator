from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from .serializers import ExamSerializer
from .models import Exam

from generator.models import ProgrammingQuestion
from generator.serializers import ProgrammingQuestionSerializer

from generator.question_generation_for_exam import generate_programming_question_for_exam

from concurrent.futures import ThreadPoolExecutor

class ExamView(APIView):
    def get(self, request, user_id, exam_id):
        exam = Exam.objects.filter(user_id=user_id, id=exam_id).first()

        if not exam:
            return Response(
                {"error": "Exam not found for this user"},
                status=status.HTTP_404_NOT_FOUND
            )

        questions = ProgrammingQuestion.objects.filter(user_id=user_id, exam_id=exam_id)

        question_serializer = ProgrammingQuestionSerializer(questions, many=True)

        exam_serializer = ExamSerializer(exam)

        return Response(data={"exam": exam_serializer.data, "questions": question_serializer.data}, status=status.HTTP_200_OK)

class ExamListView(APIView):
    def get(self, request, user_id):
        module = request.query_params.get('module')
        status_param = request.query_params.get('status')

        if module is None:
            return Response(
                {"error": "module must be selected"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Convert status to boolean
        if status_param is not None:
            status_param = status_param.lower()
            if status_param in ['true', '1', 'yes', 'True']:
                exam_status = True
            elif status_param in ['false', '0', 'no', 'False']:
                exam_status = False
            else:
                return Response(
                    {"error": "Status must be a boolean value (true/false, 1/0, yes/no)"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            exam_status = False  # or set a default value if needed

        exams = Exam.objects.filter(user_id=user_id, module=module, status=exam_status)
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

    def post(self, request, user_id, exam_id):
        body = request.data

        module = body.get('module')