from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser

import json

load_dotenv()

llm = ChatGroq(
    model="mixtral-8x7b-32768",
    temperature=0,
)

def validate_mcq_with_llm(question_text, options, correct_option):
    prompt = f"""
    Validate the following MCQ question:

    Question: {question_text}
    Options: {', '.join(options)}
    Correct Option: {correct_option}

    Requirements:
    1. Confirm if the correct option is valid.
    2. Ensure the distractors are plausible.
    3. Provide feedback on clarity and difficulty.

    Respond with your validation. You should respond JSON only with is_valid, feedback as keys.
    """
    parser = StrOutputParser()

    chain = llm | parser

    response = chain.invoke(prompt)
    print(response)

    # Replace invalid escape sequences
    response = response.replace("\\_", "_")

    # Convert string to JSON object
    data = json.loads(response)

    return data

def validate_short_answer_with_llm(question_text, expected_answers):
    prompt = f"""
    Validate the following short-answer question:

    Question: {question_text}
    Expected Answers: {', '.join(expected_answers)}

    Requirements:
    1. Confirm if the question is clear and relevant.
    2. Confirm question and answer is correct.

    Respond with your validation. You should respond JSON only with is_valid, feedback as keys.
    """
    parser = StrOutputParser()

    chain = llm | parser

    response = chain.invoke(prompt)
    print(response)

    # Replace invalid escape sequences
    response = response.replace("\\_", "_")

    # Convert string to JSON object
    data = json.loads(response)

    return data