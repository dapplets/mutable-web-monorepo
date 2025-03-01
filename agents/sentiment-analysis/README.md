# Simple Agent Example

This agent is based on OpenFaaS' template [`python3-flask`](https://github.com/openfaas/python-flask-template/blob/master/template/python3-flask/)

Install deps:

```sh
pip install -r requirements.txt
```

Run:

```sh
python index.py
```

Make HTTP request to `http://localhost:5000` to call your function.

Build and push the agent:

```sh
docker build -t ghcr.io/dapplets/sentiment-analysis-agent .
docker push ghcr.io/dapplets/sentiment-analysis-agent
```
