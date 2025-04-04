# import openai
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
import ast
import json
from pinecone import Pinecone
import tiktoken
import numpy as np
import requests

load_dotenv()

from .models import ProgrammingQuestion

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# Set your OpenAI API key
# openai.api_key = "your_openai_api_key"
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")
HUGGINGFACEHUB_API_URL = os.getenv("HUGGINGFACEHUB_API_URL")

# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)

llm = ChatGroq(
    model="mistral-saba-24b",
    temperature=0,
)

# Tokenizer for vectorization
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

def retrieve_similar_questions(topic, language, difficulty, q_type, namespace, top_k=5):
    """ Retrieve top 5 similar questions from Pinecone matching the given criteria. """
    vector = get_embedding(topic)
    namespace = str(namespace)
    results = index.query(
        vector=vector,
        top_k=top_k,
        namespace=namespace,
        include_metadata=True,
        filter={
            "language": language,
            "difficulty": difficulty,
            "type": q_type
        }
    )

    print(results)

    # similar_questions = []
    # for match in results['matches']:
    #     metadata = match['metadata']
    #     if (metadata['language'] == language and
    #         metadata['difficulty'] == difficulty and
    #         metadata['type'] == q_type):
    #         similar_questions.append(metadata['question'])

    similar_questions = [match["metadata"]["question"] for match in results["matches"]]

    return similar_questions[:top_k]

def clean_json_string(json_string):
    return json_string.replace("```json", "").replace("```", "").strip()

def generate_programming_question(topic, type, difficulty, language, user_id):
    retriever_input = f"Generate questions about: {topic}"
    # retrieved_context = retriever.retrieve(retriever_input)

    retrieved_context = "some context"

    # Retrieve top 5 similar questions
    retrieved_questions = retrieve_similar_questions(topic, language, difficulty, type, user_id)
    questions_string = '\n'.join(str(q) for q in retrieved_questions)
    print("Emitted Questions: " + questions_string)
    # questionLikeNot = [
    #     "What is the main principle of Object Oriented Programming?",
    #     "Which of the following is NOT a principle of Object Oriented Programming?",
    #     "What is encapsulation in Object Oriented Programming?",
    #     "What is the ability of an object to hide its data and methods from other objects?",
    #     "Which of the following is a principle of Object Oriented Programming?"
    # ]
    # questions_string = '\n'.join(str(x) for x in questionLikeNot)

    # questions_string = ''

    if type == "mcq":
        keys = """(question, answers, correct_answer)"""
    else:
        keys = """(question, answer)"""

    system = f"""
        You are an exper in question generation. You have to create a question for below topic with the difficulty level. and give me only the output(question and answer)
        You should create a question for the type.
        You should give me a JSON object, keys as question, answer and there values for short-answer, coding questions. 
        for coding question answer should be executable code only.
        For mcq question you should use question, answers, correct_answer as keys and there valuse
        STRICTLY FLOW THE JSON STRUCTURE. DO NOT CREATE UNNECESSARY KEYS. 
    """
    human = f"""
        Language:
        {language}
        
        Context:
        {retrieved_context}
        
        Difficulty:
        {difficulty}

        Topic:
        {topic}
        
        Type:
        {type}

        Do not include below question:
        {questions_string}
        
        Generate ONLY ONE questions about the topic using the context and difficulty level in the format.
        Only give me question and answer.
        Give me in following format: {json}
        KEYS for JSON : {keys}
        Give me in following format: JSON
        KEYS for MCQ (question, answers, correct_answer)
        KEYS for Coding, Short-answer (question, answer)
        The output must be a valid JSON, with appropriate key-value pairs.
    """
    # Combine retrieved context and topic for LLM
    prompt = f"""
        You are an exper in question generation. You have to create a question for below topic with the difficulty level. and give me only the output(question and answer)
        You should create a question for the type.
        You should give me a JSON object, keys as question, answer and there values for short-answer, coding questions. 
        for coding question answer should be executable valid code only.
        For mcq question you should use question, answers, correct_answer as keys and there valuse
        STRICTLY FLOW THE JSON STRUCTURE. DO NOT CREATE UNNECESSARY KEYS. 
        
        Language:
        {language}
        
        Context:
        {retrieved_context}
        
        Difficulty:
        {difficulty}

        Topic:
        {topic}
        
        Type:
        {type}

        Generate ONLY ONE questions about the topic using the context and difficulty level in the format.
        Only give me question and answer.
        Give me in following format: JSON
        KEYS for MCQ (question, answers, correct_answer)
        KEYS for Coding, Short-answer (question, answer)
        The output must be a valid JSON, with appropriate key-value pairs.
        """


    prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])
    parser = StrOutputParser()

    # chain = llm | parser
    chain = prompt | llm | parser
    response = chain.invoke({"language": language, "difficulty": difficulty, "topic": topic, "type": type, "json": "JSON", "keys": keys, "questions_string": questions_string})

    print(response)
    response = response.strip()  # Remove extra whitespace
    # Replace invalid escape sequences
    response = response.replace("\\_", "_")

    response = clean_json_string(response)

    data = json.loads(response)

    print(data)
    print("#################################")

    question = ProgrammingQuestion()
    question.title = topic
    question.difficulty = difficulty
    question.question_type = type
    question.language = language
    question.user_id = user_id

    if type == "mcq":
        question.description = data['question']
        question.options = data['answers']
        question.correct_option = data['correct_answer']
    elif type == "short-answer":
        question.description = data['question']
        question.expected_answers = data['answer']

    elif type == "coding":
        question.description = data['question']
        question.code_snippet = data['answer']



    print(question)
    return question


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