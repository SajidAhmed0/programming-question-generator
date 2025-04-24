import random
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers.json import JsonOutputParser
from langchain_core.prompts import MessagesPlaceholder
from langchain_core.runnables import RunnableSequence
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser

import json
from pinecone import Pinecone

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


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.5,
    api_key=OPENAI_API_KEY,
)

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = os.getenv("PINECONE_INDEX_NAME")
index = pc.Index(index_name)

def retrieve_random_vector(module_name: str):
    try:
        # Get index stats to find how many vectors are in the namespace
        stats = index.describe_index_stats()
        namespaces = stats.namespaces

        if module_name not in namespaces:
            print(f"❌ Module '{module_name}' not found in Pinecone.")
            return None

        total_vectors = namespaces[module_name].vector_count
        if total_vectors == 0:
            print(f"⚠️ No vectors found in module '{module_name}'.")
            return None

        # Pick a random index and construct the corresponding vector ID
        random_index = random.randint(0, total_vectors - 1)
        vector_id = f"{module_name}-{random_index}"

        # Fetch the vector from Pinecone
        result = index.fetch(ids=[vector_id], namespace=module_name)

        if vector_id in result.vectors:
            vector_data = result.vectors[vector_id]
            print(f"✅ Retrieved vector ID: {vector_id}")
            print(f"📄 Metadata: {vector_data.metadata}")
            print(f"📈 Vector length: {len(vector_data.values)}")
            return vector_data
        else:
            print(f"❌ Vector ID '{vector_id}' not found.")
            return None

    except Exception as e:
        print(f"🔥 Error retrieving vector: {e}")
        return None

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

def generate_programming_question(type, difficulty, user_id, module):
    retrieved_context = retrieve_random_vector(module).metadata['text']

    few_shot_mcq = """
    Example:
    {{
      "question": "What does the `len()` function do in Python?",
      "answers": ["Returns the number of items in an object", "Calculates the sum of numbers", "Sorts a list", "Deletes an item from a list"],
      "correct_answer": "Returns the number of items in an object",
      "topic": "Python built-in functions"
    }}
    """

    few_shot_short_answer = """
    Example:
    {{
      "question": "Explain the purpose of the 'final' keyword in Java.",
      "answer": "It is used to declare constants, prevent method overriding, or inheritance.",
      "topic": "Java keywords"
    }}
    """

    few_shot_coding = r"""
        Examples:
        1.
        {{
          "question": "Write a Java program to check if a number is even or odd.",
          "answer": "public class Main {{\n    public static void main(String[] args) {{\n        int num = 10;\n        if(num % 2 == 0)\n            System.out.println(\"Even\");\n        else\n            System.out.println(\"Odd\");\n    }}\n}}",
          "programming_language": "java",
          "topic": "Java conditionals"
        }}

        2.
        {{
          "question": "Write a C++ program to find the sum of two numbers.",
          "answer": "#include <iostream>\nusing namespace std;\nint main() {{\n    int a = 5, b = 3;\n    cout << \"Sum: \" << a + b;\n    return 0;\n}}",
          "programming_language": "cpp",
          "topic": "C++ basic arithmetic"
        }}

        3.
        {{
          "question": "Create a Java program that prints numbers from 1 to 5 using a loop.",
          "answer": "public class Main {{\n    public static void main(String[] args) {{\n        for(int i = 1; i <= 5; i++) {{\n            System.out.println(i);\n        }}\n    }}\n}}",
          "programming_language": "java",
          "topic": "Java loops"
        }}

        4.
        {{
          "question": "Create a C++ program to calculate the factorial of a number using a loop.",
          "answer": "#include <iostream>\nusing namespace std;\nint main() {{\n    int n = 5, factorial = 1;\n    for(int i = 1; i <= n; ++i) {{\n        factorial *= i;\n    }}\n    cout << \"Factorial: \" << factorial;\n    return 0;\n}}",
          "programming_language": "cpp",
          "topic": "C++ loops"
        }}
    """


    mcq_system = f"""
        You are an expert in programming question generation. You must create ONE question about the given context, following the mcq type and difficulty.
        Your output should STRICTLY be a valid JSON object. Generate topic for question.

        - For `mcq` type, use keys: question, answers (list of 4), correct_answer, topic.

        Only return a JSON object as output.
        {few_shot_mcq}
    """

    short_answer_system= f"""
        You are an expert in programming question generation. You must create ONE question about the given context, following the short-answer type and difficulty.
        Your output should STRICTLY be a valid JSON object. Generate topic for question.
        
        - For `short-answer`, use keys: question, answer, topic.

        Only return a JSON object as output.
        {few_shot_short_answer}
    """
    programming_language = 'python'
    instruction = ""
    if module == "Object-Oriented Programming - IT2030":
        programming_language = 'java'
        instruction = """
            Java: Must have public class Main.
            IMPORTANT:
                - If programming_language is "java", the answer MUST contain `public class Main`. No exceptions.
                - If not included, your response will be rejected. Include `public class Main` EXACTLY as shown.
            """
    elif module == "Data Structures & Algorithms - IT2070":
        programming_language = 'java, python choose one according to context'
        instruction = """
            Java: Must have public class Main.
            IMPORTANT:
                - If programming_language is "java", the answer MUST contain `public class Main`. No exceptions.
                - If not included, your response will be rejected. Include `public class Main` EXACTLY as shown.
            """
    elif module == "Object Oriented Concepts - IT1050":
        programming_language = 'cpp'
        instruction = """C++: Must include return 0; in main()."""
    elif module == "Introduction to Programming - IT1010":
        programming_language = 'c'
    elif module == "Internet And Web Technologies- IT1100":
        programming_language = 'javascript, php choose one according to context'



    coding_system = f"""
        You are an expert in programming question generation. You must create ONE question about the given context, following the coding type and difficulty.
        Your output should STRICTLY be a valid JSON object. Generate topic for question. code should we runnable without any error.
        
        - For `coding`type, use keys: question, answer, topic, programming_language({programming_language}).
        
        {instruction}

        Only return a JSON object as output.
        {few_shot_coding}
    """

    human = r"""        
        Context:
        {retrieved_context}
        
        Difficulty:
        {difficulty}
        
        Type:
        {type}
    """

    if type == "mcq":
        system = mcq_system
    if type == "coding":
        system = coding_system
    if type == "short-answer":
        system = short_answer_system

    print(system)

    prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])
    output_parser = JsonOutputParser(key_name="response")

    chain: RunnableSequence = prompt | llm | output_parser

    response = chain.invoke({"retrieved_context": retrieved_context, "type": type, "difficulty":difficulty})
    print("📦 Raw Response:\n", response)

    question_data = response
    print("#################################")

    question = ProgrammingQuestion()
    question.difficulty = difficulty
    question.question_type = type
    question.user_id = user_id
    question.title = question_data['topic']

    if type == "mcq":
        question.description = question_data['question']
        question.options = question_data['answers']
        question.correct_option = question_data['correct_answer']
    elif type == "short-answer":
        question.description = question_data['question']
        question.expected_answers = question_data['answer']

    elif type == "coding":
        question.language = question_data['programming_language']
        question.description = question_data['question']
        question.code_snippet = question_data['answer']

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