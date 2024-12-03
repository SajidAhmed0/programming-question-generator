from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

import json
# Create your views here.
from .services import generate_programming_question
from .mcq_validator import validate_mcq
from .short_answer_validator import validate_short_answer
from .automatic_validation import validate_mcq_with_llm, validate_short_answer_with_llm

from .serializers import ProgrammingQuestionSerializer

class GeneratorView(APIView):
    def get(self, request):
        question = generate_programming_question("recursion", 'mcq', 'medium')

        if question.question_type == 'mcq':
            valid = validate_mcq(question.description, question.options, question.correct_option)

            if valid['is_valid']:
                feedback = valid['feedback']
                print(f"{feedback}")
                llm_valid = validate_mcq_with_llm(question.description, question.options, question.correct_option)

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
            valid = validate_short_answer(question.description, question.expected_answers)

            if valid['is_valid']:
                feedback = valid['feedback']
                print(f"{feedback}")
                llm_valid = validate_short_answer_with_llm(question.description, question.expected_answers)

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
            print("coding validation")

        serializer = ProgrammingQuestionSerializer(question)

        return Response(data=serializer.data, status=status.HTTP_200_OK)




from django.http import JsonResponse
from .mcq_validator import validate_mcq
from .short_answer_validator import validate_short_answer

def validate_question(request):
    question_type = request.GET.get("type")
    question_text = request.GET.get("text")
    options = request.GET.getlist("options")
    correct_option = request.GET.get("correct")
    expected_answers = request.GET.getlist("answers")

    if question_type == "mcq":
        result = validate_mcq(question_text, options, correct_option)
    elif question_type == "short":
        result = validate_short_answer(question_text, expected_answers)
    else:
        return JsonResponse({"error": "Invalid question type."}, status=400)

    return JsonResponse(result)