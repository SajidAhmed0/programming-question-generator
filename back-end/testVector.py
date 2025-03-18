import requests

import os
from dotenv import load_dotenv

load_dotenv()

HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")
HUGGINGFACEHUB_API_URL = os.getenv("HUGGINGFACEHUB_API_URL")

# Replace with your Hugging Face API token
API_TOKEN = HUGGINGFACEHUB_API_TOKEN
API_URL = HUGGINGFACEHUB_API_URL

# Input text
text = "This is a sample sentence."

# Headers for authentication
headers = {"Authorization": f"Bearer {API_TOKEN}"}

# Payload for the API request
payload = {
    "inputs": text,
    "options": {"wait_for_model": True}  # Wait if the model is loading
}

# Send the request
response = requests.post(API_URL, headers=headers, json=payload)

# Get the embeddings
if response.status_code == 200:
    embeddings = response.json()
    print("Embeddings:", embeddings)
    print(len(embeddings))
else:
    print("Error:", response.status_code, response.text)