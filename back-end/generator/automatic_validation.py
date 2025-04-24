from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
import json

load_dotenv()

llm = ChatOpenAI(
    model="gpt-4",
    temperature=0,
    api_key=os.getenv("OPENAI_API_KEY")
)

parser = StrOutputParser()

def clean_json_string(json_string):
    return json_string.replace("```json", "").replace("```", "").strip()

def validate_mcq_with_llm(question):
    question_text = question.description
    options = question.options
    correct_option = question.correct_option

    prompt = f"""
        You are a question validator.
        
        Validate the following MCQ question and return ONLY a JSON object.
        
        Question: {question_text}
        Options: {', '.join(options)}
        Correct Option: {correct_option}
        
        Requirements:
        1. Confirm if the correct option exists in the options.
        2. Provide feedback on the clarity and quality of the question and options.
        
        Respond strictly with JSON:
        {{
          "is_valid": true or false,
          "feedback": "your feedback here"
        }}
    """

    chain = llm | parser
    response = chain.invoke(prompt)
    response = clean_json_string(response)

    try:
        data = json.loads(response)
    except json.JSONDecodeError as e:
        print("⚠️ JSON decode error:", e)
        return {"is_valid": False, "feedback": "Invalid JSON output from LLM"}

    return data


def validate_short_answer_with_llm(question):
    question_text = question.description
    expected_answers = question.expected_answers

    prompt = f"""
        You are a question validator.
        
        Validate the following short-answer question and return ONLY a JSON object.
        
        Question: {question_text}
        Expected Answers: {expected_answers}
        
        Requirements:
        1. Confirm the question is clear and relevant.
        2. Confirm that the expected answer is appropriate.
        
        Respond strictly with JSON:
        {{
          "is_valid": true or false,
          "feedback": "your feedback here"
        }}
    """

    chain = llm | parser
    response = chain.invoke(prompt)
    response = clean_json_string(response)

    try:
        data = json.loads(response)
    except json.JSONDecodeError as e:
        print("⚠️ JSON decode error:", e)
        return {"is_valid": False, "feedback": "Invalid JSON output from LLM"}

    return data
