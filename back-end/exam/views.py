from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from .serializers import ExamSerializer
from .models import Exam

from generator.models import ProgrammingQuestion
from generator.serializers import ProgrammingQuestionSerializer

from generator.question_generation_for_exam import generate_programming_question_for_exam
from generator.validate_answer_question_for_exam import validate_answer_question_for_exam

from user.models import UserDifficulty

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
        print(module)
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

        # Before creating exam, should create UserDifficulty for user_id, module
        # This will either get the existing record or create a new one
        user_difficulty, created = UserDifficulty.objects.get_or_create(
            user_id=user_id,
            module=module,
            defaults={
                'difficulty': 'easy',  # Default values for new records
                'average': 0.0
            }
        )

        if created:
            print(f"Created new record for {user_id} - {module}")
        else:
            print(f"Record already exists with difficulty: {user_difficulty.difficulty}")

        exam_difficulty = user_difficulty.difficulty

        exam = Exam(module=module, user_id=user_id, status=False)

        exam.save()

        questions = generate_all_questions(difficulty=exam_difficulty, user_id=user_id, module=module, exam_id=exam.id)

        total_marks = 0

        for question in questions:
            total_marks += question["allocated_marks"]
            question.exam_id = exam.id

        exam.total_marks = total_marks
        exam.difficulty = exam_difficulty

        exam.save()

        serializer = ExamSerializer(exam)

        # Setting adaptability to empty after created questions
        user_difficulty.adaptability = []

        user_difficulty.save()

        return Response(data={"exam": serializer.data, "questions": questions}, status=status.HTTP_200_OK)

def generate_all_questions(difficulty, module, user_id, exam_id):
    user_difficulty = UserDifficulty.objects.get(user_id=user_id, module=module)
    adaptability_topics = user_difficulty.adaptability

    mcq_count = len([q for q in adaptability_topics if q["question_type"] == "mcq"])
    short_answer_count = len([q for q in adaptability_topics if q["question_type"] == "short-answer"])
    coding_count = len([q for q in adaptability_topics if q["question_type"] == "coding"])

    tasks = (
        adaptability_topics +
        [{"question_type": "mcq", "topic": None}] * (6 - mcq_count) +
        [{"question_type": "short-answer", "topic": None}] * (3 - short_answer_count) +
        [{"question_type": "coding", "topic": None}] * (1 - coding_count)
    )

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(safe_generate, qtype['question_type'], difficulty, user_id, module, exam_id, qtype['topic'])
            for qtype in tasks
        ]
        return [f.result() for f in futures]

def safe_generate(qtype, difficulty, user_id, module, exam_id, topic, retries=3):
    for _ in range(retries):
        try:
            return generate_programming_question_for_exam(qtype, difficulty, user_id, module, exam_id, topic)
        except Exception as e:
            continue
    return {"error": f"Failed to generate {qtype} question"}


class ExamAnswerView(APIView):

    def post(self, request, user_id, exam_id):
        body = request.data

        exam = body.get('exam')
        answer_questions = body.get('questions')

        stored_exam = Exam.objects.filter(id=exam_id).first()

        if user_id != int(exam['user_id']):
            return Response(
                {"error": "Exam is not belong to this user"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not stored_exam:
            return Response(
                {"error": "Exam not found for this user"},
                status=status.HTTP_404_NOT_FOUND
            )

        is_completed = exam['status']

        if is_completed:
            stored_exam.completed_at = exam['completed_at']
            validated_questions = validate_answer_all_questions(answer_questions)

            total_student_marks = 0

            for validated_question in validated_questions:
                total_student_marks += validated_question['student_marks']

            stored_exam.student_marks = total_student_marks
            stored_exam.status = is_completed

            stored_exam.save()

            serializer = ExamSerializer(stored_exam)

            # Difficulty level update
            module = exam['module']
            exams_for_average = Exam.objects.filter(user_id=user_id, module=module, status=True)
            total_marks_for_average = 0
            for exam_for_average in exams_for_average:
                total_marks_for_average += (exam_for_average.student_marks * 5)

            average = total_marks_for_average / len(exams_for_average)
            print(f"total: {total_marks_for_average} total_exam: {len(exams_for_average)}  average: {average}")

            user_difficulty, created = UserDifficulty.objects.get_or_create(
                user_id=user_id,
                module=module,
                defaults={
                    'difficulty': 'easy',  # Default values for new records
                    'average': 0.0
                }
            )
            # user_difficulty = UserDifficulty.objects.get(user_id=user_id, module=module)
            user_difficulty.average = average
            difficulty = ''
            if average < 50:
                difficulty = 'easy'
            elif average < 75:
                difficulty = 'medium'
            else:
                difficulty = 'hard'

            user_difficulty.difficulty = difficulty

            # Get invalid answer question for adaptability
            adaptability_topics = []
            for validated_question in validated_questions:
                if validated_question['is_correct'] == False:
                    topic = {
                        "topic": validated_question['title'],
                        "question_type": validated_question['question_type']
                    }
                    adaptability_topics.append(topic)

            user_difficulty.adaptability = adaptability_topics

            user_difficulty.save()

            return Response(data={"exam": serializer.data, "questions": validated_questions}, status=status.HTTP_200_OK)

        else:
            return Response(data={"error: Exam should be completed"}, status=status.HTTP_400_BAD_REQUEST)


def validate_answer_all_questions(questions):

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(safe_validate_answer, answer_question)
            for answer_question in questions
        ]
        return [f.result() for f in futures]

def safe_validate_answer(answer_question, retries=3):
    for _ in range(retries):
        try:
            return validate_answer_question_for_exam(answer_question)
        except Exception as e:
            continue
    return {"error": f"Failed to evaluate {answer_question['id']} question"}