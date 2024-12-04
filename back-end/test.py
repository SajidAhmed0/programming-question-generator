import requests
import time
import json

# Judge0 API URL
JUDGE0_URL = 'http://localhost:2358/submissions'

def run_code(language, code):
    """
    Run the given code snippet in the specified language using the Judge0 API.
    """
    # Define supported languages
    languages = {
        "python": 71,  # Python 3
        "javascript": 63,  # Node.js
        "java": 62  # Java
    }

    # Check if the language is supported
    if language not in languages:
        return {"is_valid": False, "output": "Language not supported"}

    # Prepare the payload for the request
    payload = {
        "source_code": code,
        "language_id": languages[language],
        "stdin": "",  # Optionally, provide input for the program
        "expected_output": "",  # Optionally, provide expected output for comparison
        "cpu_time_limit": 2,  # Execution time limit in seconds
        "memory_limit": 128000  # Memory limit in KB (128MB)
    }

    # Submit the code to Judge0 API
    response = requests.post(JUDGE0_URL, data=json.dumps(payload), headers={'Content-Type': 'application/json'})

    if response.status_code != 200:
        return {"is_valid": False, "output": "Failed to submit code"}

    # Extract the token from the response
    submission_token = response.json()['token']

    # Poll the status of the submission
    while True:
        result_url = f'{JUDGE0_URL}/{submission_token}'
        result_response = requests.get(result_url)

        if result_response.status_code != 200:
            return {"is_valid": False, "output": "Failed to retrieve result"}

        result = result_response.json()

        if result['status']['id'] != 1:  # ID 1 means "Processing", 2 means "Finished"
            break

        time.sleep(1)  # Wait for a second before polling again

    # Check if the code execution was successful
    if result['status']['id'] == 3:  # ID 3 means "Accepted"
        return {"is_valid": True, "output": result['stdout']}
    else:
        return {"is_valid": False, "output": result['stderr']}

# Example usage
python_code = """
x = 10
y = 20
print(x + y)
"""
js_code = """
const x = 10;
const y = 20;
console.log(x + y);
"""
java_code = """
public class Test {
    public static void main(String[] args) {
        System.out.println(10 + 20);
    }
}
"""

# Running code snippets
result = run_code('python', python_code)
print("Python Result:", result)

result = run_code('javascript', js_code)
print("JavaScript Result:", result)

result = run_code('java', java_code)
print("Java Result:", result)
