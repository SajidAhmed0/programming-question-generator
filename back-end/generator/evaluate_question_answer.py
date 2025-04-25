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
              "is_correct": true,
              "marks": 5,
              "feedback": "Excellent! Your answer is complete and syntactically correct."
            }}
    
            2.
            {{
              "is_correct": true,
              "marks": 3,
              "feedback": "Good attempt! Logic is mostly correct but has minor syntax or formatting issues."
            }}
    
            3.
            {{
              "is_correct": true,
              "marks": 1,
              "feedback": "The answer shows partial understanding but is incomplete or contains significant errors."
            }}
    
            4.
            {{
              "is_correct": false,
              "marks": 0,
              "feedback": "The answer is incorrect and does not meet the requirements of the question."
            }}
        """

        system = f"""
            You are an expert programming evaluator. Your task is to evaluate the student's coding answer based on the provided question and correct answer.
            The student's answer is not required to be executed. Only check and evaluate concept.
            Return your evaluation STRICTLY as a valid JSON object.
    
            Keys to include:
            - "is_correct": true or false (true if the answer is fully or partially correct, false only if completely wrong)
            - "marks": integer between 0 to 5
            - "feedback": specific and constructive feedback
    
            Evaluation Rules:
            1. If the answer is entirely incorrect or does not show understanding, assign 0 marks and set is_correct to false.
            2. If the answer shows partial correctness (e.g., correct logic but syntax error or incomplete), assign marks from 1 to 4 and set is_correct to true.
            3. Only assign 5 marks if the answer is correct, complete, and syntactically valid.
            4. Always provide helpful feedback explaining your assessment.
            5. If marks > 0, is_correct must be true.
    
            Only return the JSON object as output.
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