import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers.json import JsonOutputParser
from langchain_core.runnables import RunnableSequence
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.5,
    api_key=OPENAI_API_KEY,
)

def evaluate_question_answer(answer_question):
    question_description = answer_question["description"]
    question_type = answer_question["question_type"]

    if question_type == 'mcq':
        correct_option = answer_question["correct_option"]
        allocated_marks = answer_question["allocated_marks"]
        student_answer = answer_question["student_answer"]

        if correct_option == student_answer:
            return {
                "is_correct": True,
                "marks": allocated_marks,
                "feedback": "Correct answer"
            }
        else:
            return {
                "is_correct": False,
                "marks": 0,
                "feedback": "Incorrect answer"
            }

    elif question_type == 'short-answer':
        expected_answers = answer_question["expected_answers"]
        allocated_marks = answer_question["allocated_marks"]
        student_answer = answer_question["student_answer"]

        few_shot_short_answer = """
            Example:
            1.
            {{
              "is_correct": true ,
              "marks": 3,
              "feedback": "your feedback here"
            }}
            
            2.
            {{
              "is_correct": true ,
              "marks": 2,
              "feedback": "your feedback here"
            }}
            
            3.
            {{
              "is_correct": true ,
              "marks": 1,
              "feedback": "your feedback here"
            }}
            
            4.
            {{
              "is_correct": false ,
              "marks": 0,
              "feedback": "your feedback here"
            }}
        """

        system = f"""
            You are an expert evaluator. You must evaluate given short-answer question with real answer and user answer, And give marks according to allocated marks.
            Your output should STRICTLY be a valid JSON object.

            - For output, use keys: is_correct(true or false), marks (0 - 3), and feedback.
            
            Requirements:
            1. Confirm if the answer is correct.
            2. Give marks according to student answer.
            3. Give feedback for student answer.
            4. If answer is wrong then marks is 0.

            Only return a JSON object as output.
            {few_shot_short_answer}
        """

        human = r"""        
            Question:
            {question_description}

            Actual Answer:
            {expected_answers}

            Student Answer:
            {student_answer}
            
            Allocated Marks:
            {allocated_marks}
        """

    elif question_type == 'coding':
        code_snippet = answer_question["code_snippet"]
        allocated_marks = answer_question["allocated_marks"]
        student_answer = answer_question["student_answer"]

        expected_answers = code_snippet

        few_shot_coding = """
            Example:
            1.
            {{
              "is_correct": true ,
              "marks": 5,
              "feedback": "your feedback here"
            }}

            2.
            {{
              "is_correct": true ,
              "marks": 3,
              "feedback": "your feedback here"
            }}

            3.
            {{
              "is_correct": true ,
              "marks": 1,
              "feedback": "your feedback here"
            }}

            4.
            {{
              "is_correct": false ,
              "marks": 0,
              "feedback": "your feedback here"
            }}
        """

        system = f"""
            You are an expert evaluator. You must evaluate given coding question with real answer and user answer, And give marks according to allocated marks.
            Your output should STRICTLY be a valid JSON object.

            - For output, use keys: is_correct(true or false), marks (0 - 5), and feedback.
            
            Requirements:
            1. Confirm if the answer is correct.
            2. Give marks according to student answer.
            3. Give feedback for student answer.
            4. If answer is wrong then marks is 0.
            5. If answer is some what correct and there is some syntax error or run time error adjust marks accordingly (1 - 5).
            6. If answer is some what correct always reduce the marks instead of making it as incorrect. if marks is greater than 0 then is_correct = true

            Only return a JSON object as output.
            {few_shot_coding}
        """

        human = r"""        
            Question:
            {question_description}

            Actual Answer:
            {expected_answers}

            Student Answer:
            {student_answer}

            Allocated Marks:
            {allocated_marks}
        """

    prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])
    output_parser = JsonOutputParser(key_name="response")

    chain: RunnableSequence = prompt | llm | output_parser

    response = chain.invoke({"question_description": question_description, "expected_answers": expected_answers,
                             "student_answer": student_answer, "allocated_marks": allocated_marks})
    print("📦 Raw Response:\n", response)

    return response