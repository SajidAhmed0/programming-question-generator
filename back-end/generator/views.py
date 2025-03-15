from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
import ast

import json
# Create your views here.
from .services import generate_programming_question
from .mcq_validator import validate_mcq
from .short_answer_validator import validate_short_answer
from .automatic_validation import validate_mcq_with_llm, validate_short_answer_with_llm
from .coding_validator import validate_coding_sandboxed

from .serializers import ProgrammingQuestionSerializer

class GeneratorView(APIView):
    def post(self, request):
        body = request.data
        topic = body.get('topic')
        type = body.get('type')
        difficulty = body.get('difficulty')
        language = body.get('language')

        question = generate_programming_question(topic, type, difficulty, language)

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
            # valid = validate_coding(question)
            valid = validate_coding_sandboxed(question.code_snippet, 'python')

            if valid['is_valid']:
                feedback = valid['feedback']
                question.validated = True
                print(f"{feedback}")
            else:
                feedback = valid['feedback']
                print(f"{feedback}")

        serializer = ProgrammingQuestionSerializer(question)

        return Response(data=serializer.data, status=status.HTTP_200_OK)
