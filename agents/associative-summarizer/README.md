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
docker buildx create --use # if you didn't it before
docker buildx build --platform linux/amd64,linux/arm64 . --tag ghcr.io/dapplets/associative-summarizer-agent:latest --push 
```
