from textblob import TextBlob
import json


def handle(req):
    input = json.loads(req)  # deserialize input json string

    """
    input = {
        "context": {
            "namespace": "dapplets.near/parser/twitter",
            "contextType": "post",
            "id": "1234567890123456789",
            "parsedContext": {
                "text": "This is a sample post containing some text for demonstration purposes.",
                "authorFullname": "John Doe",
                "authorUsername": "john_doe",
                "authorImg": "https://example.com/image.png",
                "createdAt": "2025-02-19T20:33:29.000Z",
                "url": "https://twitter.com/john_doe/status/1234567890123456789",
            },
        }
    }
    """

    # Sentiment Analysis
    sentiment = TextBlob(input["context"]["parsedContext"]["text"]).sentiment

    # Summary Output
    output = {
        "context": {
            "namespace": "dapplets.near/agent/simple-agent",
            "contextType": "sentiment",
            "id": input["context"]["id"],  # copy context id from input
            "parsedContext": {
                "polarity": sentiment.polarity,
                "subjectivity": sentiment.subjectivity,
            },
        }
    }

    # serialize output
    return json.dumps(output)
