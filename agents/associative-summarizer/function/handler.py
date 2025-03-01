import json
import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import pipeline

# Load the SentenceTransformer model to compute embeddings
model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize the summarization pipeline with the explicitly specified model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Sample vector database with documents.
# In a real-world application, these embeddings would be precomputed and stored in a persistent vector database.
vector_db = [
    {"id": "doc1", "text": "Sample content similar to text A."},
    {"id": "doc2", "text": "Another piece of content that relates to text B."},
    {"id": "doc3", "text": "Further content that might match with text C."},
    {"id": "doc4", "text": "Additional text that can be relevant."},
]

# Precompute embeddings for documents in the vector database
for doc in vector_db:
    doc["embedding"] = model.encode(doc["text"])


def cosine_similarity(vec1, vec2):
    """Compute the cosine similarity between two vectors."""
    if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
        return 0.0
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))


def search_vector_db(query_text, top_k):
    """
    Compute the embedding for the query text and search for the top_k most similar documents
    in the vector database using cosine similarity.

    Args:
        query_text (str): The input text to search for similar documents.
        top_k (int): The number of top similar documents to return.

    Returns:
        List[Dict]: A list of dictionaries containing the document id, text, and similarity score.
    """
    # Compute the embedding for the query text
    query_embedding = model.encode(query_text)

    # Calculate cosine similarity between the query embedding and each document's embedding
    results = []
    for doc in vector_db:
        sim = cosine_similarity(query_embedding, doc["embedding"])
        results.append(
            {
                "id": doc["id"],
                "text": doc["text"],
                "similarity": float(sim),  # convert numpy.float32 to Python float
            }
        )

    # Sort the results by similarity in descending order and return the top_k results
    results = sorted(results, key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]


def handle(req):
    """
    Process the input JSON, search for similar documents in the vector database,
    concatenate all similar texts, summarize them using an LLM model, and return the results.

    Args:
        req (str): A JSON string with the following structure:
        {
            "context": {
                "namespace": "dapplets.near/parser/twitter",
                "contextType": "post",
                "id": "1234567890123456789",
                "parsedContext": {
                    "text": "Text to search in the vector database.",
                    "authorFullname": "John Doe",
                    "authorUsername": "john_doe",
                    "authorImg": "https://example.com/image.png",
                    "createdAt": "2025-02-19T20:33:29.000Z",
                    "url": "https://twitter.com/john_doe/status/1234567890123456789"
                }
            }
        }

    Returns:
        str: A JSON string with the following structure:
        {
            "context": {
                "namespace": "dapplets.near/agent/vector-search",
                "contextType": "similarity",
                "id": "<same as input id>",
                "parsedContext": {
                    "results": [<list of similar documents>],
                    "summary": "<summarized text>"
                }
            }
        }
    """
    # Deserialize the input JSON
    data = json.loads(req)

    # Extract the text to search from the parsed context
    text = data["context"]["parsedContext"]["text"]

    # Perform the search in the vector database.
    # Here, we get all similar documents by setting top_k to the size of the vector_db.
    similar_items = search_vector_db(text, top_k=len(vector_db))

    # Concatenate all similar document texts into one continuous string
    combined_text = " ".join([doc["text"] for doc in similar_items])

    # Use the summarization model (LLM) to summarize the combined text
    # Adjust max_length and min_length as needed
    summary_result = summarizer(
        combined_text, max_length=150, min_length=30, do_sample=False
    )
    summary_text = summary_result[0]["summary_text"] if summary_result else ""

    # Build the output JSON with the search results and the summary
    output = {
        "context": {
            "namespace": "dapplets.near/agent/vector-search",
            "contextType": "similarity",
            "id": data["context"]["id"],
            "parsedContext": {"results": similar_items, "summary": summary_text},
        }
    }

    # Serialize and return the output JSON
    return json.dumps(output)


# if __name__ == "__main__":
#     # Test input JSON
#     test_input = {
#         "context": {
#             "namespace": "dapplets.near/parser/twitter",
#             "contextType": "post",
#             "id": "1234567890123456789",
#             "parsedContext": {
#                 "text": "Example text to search for similar associations in the vector database.",
#                 "authorFullname": "John Doe",
#                 "authorUsername": "john_doe",
#                 "authorImg": "https://example.com/image.png",
#                 "createdAt": "2025-02-19T20:33:29.000Z",
#                 "url": "https://twitter.com/john_doe/status/1234567890123456789",
#             },
#         }
#     }

#     # Serialize the test input and call the handle function
#     test_req = json.dumps(test_input)
#     result = handle(test_req)
#     print(result)
