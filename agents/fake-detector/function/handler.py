import json
from openai import OpenAI

client = OpenAI(api_key="") # ToDo: Set your OpenAI API key

# Set your OpenAI API key


def get_fake_text_similarity(system_prompt, message_text, model="gpt-3.5-turbo"):
    """
    Calls the OpenAI ChatCompletion API with a system prompt and message text.
    The model is expected to return a numerical score and a justification regarding how similar
    the provided text is to fake or misleading content.

    Args:
        system_prompt (str): The system prompt to set the model context.
        message_text (str): The message text to evaluate.
        model (str): The OpenAI model to use. Default is 'gpt-3.5-turbo'.

    Returns:
        dict: A dictionary containing the score and explanation.
    """
    # Prepare messages for ChatCompletion
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": message_text},
    ]

    # Call the OpenAI ChatCompletion API
    response = client.chat.completions.create(model=model,
    messages=messages,
    temperature=0)

    # Extract the answer from the API response
    answer = response.choices[0].message.content

    # Attempt to parse the answer expecting a format like:
    # "Score: <number>\nExplanation: <explanation text>"
    score = None
    explanation = None

    try:
        # Split the response into lines
        lines = answer.splitlines()
        for line in lines:
            if line.lower().startswith("score:"):
                # Extract the numeric value after "Score:"
                score_str = line.split(":", 1)[1].strip()
                score = float(score_str)
            elif line.lower().startswith("explanation:"):
                explanation = line.split(":", 1)[1].strip()
    except Exception as e:
        # If parsing fails, return the raw answer as explanation
        explanation = answer

    if score is not None and explanation is not None:
        return {"score": score, "explanation": explanation}
    else:
        return {"raw_answer": answer}


def handle(req):
    """
    Processes the input JSON, sends the system prompt and message text to the OpenAI API,
    and returns the model's response with a similarity score and justification.

    Input JSON structure:
    {
        "context": {
            "namespace": "dapplets.near/parser/your_source",
            "contextType": "post",
            "id": "unique_identifier",
            "parsedContext": {
                "system_prompt": "Your system prompt here.",
                "text": "The message text to evaluate."
            }
        }
    }

    Output JSON structure:
    {
        "context": {
            "namespace": "dapplets.near/agent/openai-fake-text-detector",
            "contextType": "similarity",
            "id": "<same as input id>",
            "parsedContext": {
                "result": {
                    "score": <numerical value>,
                    "explanation": "<justification text>"
                }
            }
        }
    }
    """
    # Deserialize the input JSON
    data = json.loads(req)

    # Extract the system prompt and message text from the parsed context
    parsed_context = data["context"]["parsedContext"]
    system_prompt = "Evaluate the following text and determine how similar it is to fake or misleading content. Provide a score between 0 and 1, where 0 means not at all similar and 1 means extremely similar. Then provide a justification for the score."
    message_text = parsed_context["text"]

    # Get the similarity result from the OpenAI API
    result = get_fake_text_similarity(system_prompt, message_text)

    # Build the output JSON with the result
    output = {
        "context": {
            "namespace": "dapplets.near/agent/fake-detector",
            "contextType": "similarity",
            "id": data["context"]["id"],
            "parsedContext": {"result": result},
        }
    }

    # Serialize and return the output JSON
    return json.dumps(output)


# if __name__ == "__main__":
#     # Example test input JSON
#     test_input = {
#         "context": {
#             "namespace": "dapplets.near/parser/your_source",
#             "contextType": "post",
#             "id": "1234567890123456789",
#             "parsedContext": {
#                 "text": "Microsoft today introduced Majorana 1, the world’s first quantum chip powered by a new Topological Core architecture that it expects will realize quantum computers capable of solving meaningful, industrial-scale problems in years, not decades.",
#             },
#         }
#     }

#     # Serialize the test input and call the handle function
#     test_req = json.dumps(test_input)
#     result = handle(test_req)
#     print(result)
