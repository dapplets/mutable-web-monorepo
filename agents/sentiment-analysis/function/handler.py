import json
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

nltk.download("vader_lexicon")


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
                "url": "https://twitter.com/john_doe/status/1234567890123456789"
            }
        }
    }
    """

    text = input["context"]["parsedContext"]["text"]

    analyzer = SentimentIntensityAnalyzer()
    sentiment_scores = analyzer.polarity_scores(text)

    output = {
        "context": {
            "namespace": "dapplets.near/agent/sentiment-analysis",
            "contextType": "sentiment",
            "id": input["context"]["id"],
            "parsedContext": {
                "negative": sentiment_scores["neg"],
                "neutral": sentiment_scores["neu"],
                "positive": sentiment_scores["pos"],
                "compound": sentiment_scores["compound"],
            },
        }
    }

    return json.dumps(output)
