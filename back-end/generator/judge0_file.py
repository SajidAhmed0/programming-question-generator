import requests
import time
from dotenv import load_dotenv
import os

# Load environment variables (store API keys securely)
load_dotenv()

JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com"
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")  # Only if using RapidAPI


def execute_code(code, language_id=71):  # Default: Python (71)
    headers = {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,  # Only for RapidAPI
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
    }

    data = {
        "source_code": code,
        "language_id": language_id,
    }

    # Submit the code for execution
    submission_response = requests.post(
        f"{JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false",
        json=data,
        headers=headers
    )
    submission_id = submission_response.json()["token"]

    # Poll for the result (since Judge0 is async)
    result = None
    for _ in range(10):  # Retry for 10 seconds
        result_response = requests.get(
            f"{JUDGE0_API_URL}/submissions/{submission_id}",
            headers=headers
        )
        result = result_response.json()
        if result["status"]["id"] not in [1, 2]:  # 1=In Queue, 2=Processing
            break
        time.sleep(1)  # Wait before checking again

    return result


# Example Usage
if __name__ == "__main__":
    python_code = """
print("Hello, Judge0!")
a = 5
b = 10
print(a + b
"""
    execution_result = execute_code(python_code)
    print("Output:", execution_result.get("stdout"))
    print("Error:", execution_result.get("stderr"))
    print("Status:", execution_result.get("status", {}).get("description"))
    print(execution_result)

