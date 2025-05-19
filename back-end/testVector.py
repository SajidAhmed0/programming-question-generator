import os
import random
from pinecone import Pinecone
from dotenv import load_dotenv

from langchain_openai import OpenAIEmbeddings

# Load environment variables
load_dotenv()

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = os.getenv("PINECONE_INDEX_NAME")
index = pc.Index(index_name)

embedder = OpenAIEmbeddings(model="text-embedding-3-small")

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


def retrieve_vector_for_topic(module_name: str, topic, top_k=2):
    vector = embedder.embed_query(topic)
    namespace = module_name
    results = index.query(
        vector=vector,
        top_k=top_k,
        namespace=namespace,
        include_metadata=True,
    )

    texts = [match["metadata"]["text"] for match in results["matches"]]

    return texts[:top_k]

# Example usage
if __name__ == "__main__":
    module = "Object-Oriented Programming - IT2030"  # Update this as needed
    # retrieve_random_vector(module)

    print(retrieve_vector_for_topic(module, 'array in java'))