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
from .models import ProgrammingQuestion
import os
from dotenv import load_dotenv
import requests
from pinecone import Pinecone

load_dotenv()

HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")
HUGGINGFACEHUB_API_URL = os.getenv("HUGGINGFACEHUB_API_URL")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)

class QuestionListView(APIView):
    def get(self, request, user_id):
        language = request.GET.get('language', '')
        type = request.GET.get('type', '')
        difficulty = request.GET.get('difficulty', '')

        if language == '':
            language = None

        if type == '':
            type = None

        if difficulty == '':
            difficulty = None

        if language is None and type is None:
            if difficulty is None:
                questions = ProgrammingQuestion.objects.filter(user_id=user_id)
            else:
                questions = ProgrammingQuestion.objects.filter(user_id=user_id, difficulty=difficulty)
        elif language is not None and type is None:
            if difficulty is None:
                questions = ProgrammingQuestion.objects.filter(user_id=user_id, language=language)
            else:
                questions = ProgrammingQuestion.objects.filter(user_id=user_id, language=language, difficulty=difficulty)
        elif language is None and type is not None:
            if difficulty is None:
                questions = ProgrammingQuestion.objects.filter(user_id=user_id, question_type=type)
            else:
                questions = ProgrammingQuestion.objects.filter(user_id=user_id, question_type=type, difficulty=difficulty)
        else:
            if difficulty is None:
                questions = ProgrammingQuestion.objects.filter(user_id=user_id, language=language, question_type=type)
            else:
                questions = ProgrammingQuestion.objects.filter(user_id=user_id, language=language,
                                                               question_type=type, difficulty=difficulty)

        serializer = ProgrammingQuestionSerializer(questions, many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)

class GeneratorView(APIView):
    def post(self, request, user_id):
        body = request.data
        topic = body.get('topic')
        type = body.get('type')
        difficulty = body.get('difficulty')
        language = body.get('language')


        question = generate_programming_question(topic, type, difficulty, language, user_id)

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
            valid = validate_coding_sandboxed(question.code_snippet, question.language)

            if valid['is_valid']:
                feedback = valid['feedback']
                question.validated = True
                print(f"{feedback}")
            else:
                feedback = valid['feedback']
                print(f"{feedback}")
        question.user_id = user_id
        question.save()

        serializer = ProgrammingQuestionSerializer(question)

        # Store in Pinecone
        store_in_pinecone(question.user_id, topic, question)

        return Response(data=serializer.data, status=status.HTTP_200_OK)

def get_embedding(text):
    headers = {"Authorization": f"Bearer {HUGGINGFACEHUB_API_TOKEN}"}

    # Payload for the API request
    payload = {
        "inputs": text,
        "options": {"wait_for_model": True}  # Wait if the model is loading
    }
    # Send the request
    response = requests.post(HUGGINGFACEHUB_API_URL, headers=headers, json=payload)
    # Get the embeddings
    if response.status_code == 200:
        embeddings = response.json()
        return embeddings
    else:
        print("Error:", response.status_code, response.text)
        return []

def store_in_pinecone(user_id, topic, question_data):
    """ Store the generated question in Pinecone with metadata. """
    namespace = str(user_id)
    print("NameSpace: " + namespace)
    vector = get_embedding(question_data.description)
    question_id =str(question_data.id)
    metadata = {
        "user_id": namespace,
        "topic": topic,
        "question": question_data.description,
        "language": question_data.language,
        "difficulty": question_data.difficulty,
        "type": question_data.question_type
    }

    # index.upsert([(namespace, vector, metadata)])
    # index.upsert([(namespace, vector, metadata)])
    index.upsert(
        vectors=[{
            "id": question_id,
            "values": vector,
            "metadata": metadata
        }],
        namespace=namespace
    )

    print("Question stored in Pinecone.")