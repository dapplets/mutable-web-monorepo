import json
import requests
from transformers import pipeline

# Initialize the summarization pipeline with the explicitly specified model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

aigencyBaseUrl = "https://api.aigency.augm.link"


def search_vector_db(context):
    url = f"{aigencyBaseUrl}/context/similar"
    headers = {"Content-Type": "application/json"}
    data = {"context": context, "limit": 5}
    response = requests.post(url, headers=headers, data=json.dumps(data))
    results = response.json()
    return results["contexts"]


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
    context = data["context"]

    # Perform the search in the vector database.
    similar_contexts = search_vector_db(context)

    # Concatenate all similar document texts into one continuous string
    combined_text = " ".join([doc["parsedContext"]["text"] for doc in similar_contexts])

    # Use the summarization model (LLM) to summarize the combined text
    # Adjust max_length and min_length as needed
    summary_result = summarizer(
        combined_text, max_length=150, min_length=30, do_sample=False
    )
    summary_text = summary_result[0]["summary_text"] if summary_result else ""

    # Build the output JSON with the search results and the summary
    output = {
        "context": {
            "namespace": "dapplets.near/agent/associative-summarizer",
            "contextType": "similarity",
            "id": data["context"]["id"],
            "parsedContext": {"results": similar_contexts, "summary": summary_text},
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
