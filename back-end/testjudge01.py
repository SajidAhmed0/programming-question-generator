import requests
import time

# Judge0 API Endpoint
# API_URL = "https://api.judge0.com/submissions"
API_URL = "http://localhost:2358/submissions"

# Programming language IDs (Python = 71, C++ = 54, Java = 62)
language_id = 71  # Change this for different languages

# Code to execute (replace with LLM-generated code)
code = """
print("Hello, Judge0!")
"""

# Step 1: Submit Code for Execution
response = requests.post(
    f"{API_URL}?base64_encoded=false&wait=false",
    json={"source_code": code, "language_id": language_id},
    headers={"Content-Type": "application/json"}
)
submission_token = response.json()["token"]

# Step 2: Poll for Result
result = None
while True:
    result = requests.get(f"{API_URL}/{submission_token}").json()
    if result.get("status", {}).get("id") > 2:  # 3 = Completed
        break
    time.sleep(2)  # Wait and retry

# Print Output
print("Execution Result:", result["stdout"] if result["stdout"] else result["status"]["description"])
