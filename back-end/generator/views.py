from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status


# Create your views here.
from .services import generate_programming_question

class GeneratorView(APIView):
    def get(self, request):
        generate_programming_question("recursion", 'mcq', 'medium')





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