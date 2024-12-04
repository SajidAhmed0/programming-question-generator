# import openai
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
import ast
import json

load_dotenv()

from .models import ProgrammingQuestion
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# Set your OpenAI API key
# openai.api_key = "your_openai_api_key"
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

llm = ChatGroq(
    model="mixtral-8x7b-32768",
    temperature=0,
)

def generate_programming_question(topic, type, difficulty):
    retriever_input = f"Generate questions about: {topic}"
    # retrieved_context = retriever.retrieve(retriever_input)

    retrieved_context = "some context"


    # Combine retrieved context and topic for LLM
    prompt = f"""
        You are an exper in question generation. You have to create a question for below topic with the difficulty level. and give me only the output(question and answer)
        You should create a question for the type.
        You should give me a JSON object, keys as question, answer and there values for short-answer, coding questions. 
        for coding question answer should be executable code only.
        For mcq question you should use question, answers, correct_answer as keys and there valuse
        STRICTLY FLOW THE JSON STRUCTURE. DO NOT CREATE UNNECESSARY KEYS. 
        
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

    parser = StrOutputParser()

    chain = llm | parser

    response = chain.invoke(prompt)
    print(response)
    response = response.strip()  # Remove extra whitespace
    # Replace invalid escape sequences
    response = response.replace("\\_", "_")

    data = json.loads(response)

    print(data)
    print("#################################")

    question = ProgrammingQuestion()
    question.title = topic
    question.difficulty = difficulty
    question.question_type = type

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