# import openai
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser

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
groq_model = ChatGroq(
    model="mixtral-8x7b-32768",
    temperature=0,
)

def extract_question_answer(input_string):
    # Split the input string at the first occurrence of the answer section
    question_part, answer_part = input_string.split("Answer:", 1)

    # Clean up the question and answer parts
    question = question_part.replace("Question:", "").strip()
    answer = answer_part.strip()

    return question, answer

def generate_programming_question(topic, type, difficulty):
    retriever_input = f"Generate questions about: {topic}"
    # retrieved_context = retriever.retrieve(retriever_input)

    retrieved_context = "some context"

    if type == "mcq":
        format = """
        Quesiton: [question]
        Answer: 1. [answer1]
                2. [answer2]
                3. [answer3]
                4. [answer4]
        Correct Answer: [correct answer]
        """
    elif type == "short-answer":
        format = """
        Quesiton: [question]
        Answer: [answer]
                """

    elif type == "coding":
        format = """ coding means, answer should me coding part only and it should execute withou error.
        Question: [question]
        Answer: [answer]
        """

    # Combine retrieved context and topic for LLM
    prompt = f"""
        You are an exper in question generation. You have to create a question for below topic with the difficulty level. and give me only the output(question and answer)
        You should create a question for the type. 
        Context:
        {retrieved_context}
        
        Difficulty:
        {difficulty}

        Topic:
        {topic}
        
        Type:
        {type}

        Generate a questions about the topic using the context and difficuly level in the format.
        Only give me question and answer.
        Give me in following format: {format}
        
        """

    parser = StrOutputParser()

    chain = groq_model | parser

    response = chain.invoke(prompt)
    print(response)
    print("#################################")
    # response = llm(prompt, max_tokens=500)

    # data = response.choices[0].text.strip()
    #
    # # Parse data into fields (assumes structured response)
    # # Example Parsing Logic:
    # title, description, code, output = data.split("\n\n")  # Customize parsing based on prompt response
    #
    # # Save to database
    # question = ProgrammingQuestion.objects.create(
    #     title=title,
    #     description=description,
    #     code_snippet=code,
    #     expected_output=output,
    #     difficulty='medium'
    # )

    # question = ProgrammingQuestion.objects.create(
    #     title=topic,
    #     question_type=type,
    #     difficulty=difficulty
    # )

    question = ProgrammingQuestion()
    if type == "mcq":
        question.description = ""
        question.options = ""
        question.correct_option = ''
    elif type == "short-answer":
        question_txt, answer_txt = extract_question_answer(response)
        print(f"qqq => {question_txt}")
        print(f"ans => {answer_txt}")
        question.description = ""
        question.expected_answers = ""

    elif type == "coding":
        question.description = ""
        question.expected_output = ""

    questions = response.strip().split("\n\n")  # Assuming structured response

    # Save questions to the database
    question_objects = []
    for question in questions:
        # Parse the question type and details (customize this parsing logic)
        question_type = "mcq" if "Options" in question else "short" if "Answer" in question else "coding"
        details = {
            "title": question.split("\n")[0],
            "description": question,
            "question_type": question_type,
        }
        question_objects.append(ProgrammingQuestion(**details))
    # ProgrammingQuestion.objects.bulk_create(question_objects)
    # for question in question_objects:
    #
    #     print(question)
    return question_objects