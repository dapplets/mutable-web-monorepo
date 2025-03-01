# Crawler Agent

## Development

```sh
cd mutable-web-monorepo
pnpm i

cd agents/crawler
pnpm run build
pnpm run start
```

Make POST HTTP request to `http://localhost:5000` to call your function.

Request body example:

```json
{
  "context": {
    "namespace": "engine",
    "contextType": "website",
    "id": "github.com",
    "parsedContext": {
      "id": "github.com",
      "url": "https://github.com/dapplets/mutable-web-monorepo/pull/54"
    }
  }
}
```

Response body example:

```json
{
  "contexts": [
    {
      "namespace": "bos.dapplets.testnet/parser/github",
      "contextType": "post",
      "id": "issuecomment-2561363118",
      "parsedContext": {
        "authorUsername": "apps/github-actions",
        "authorImg": "https://avatars.githubusercontent.com/in/15368?s=80&v=4",
        "url": "https://github.com/dapplets/mutable-web-monorepo/pull/54#issuecomment-2561363118",
        "createdAt": "2024-12-24T19:28:12Z",
        "text": "Build Preview You can find files attached to the below linked Workflow Run URL (Logs). Please note that files only stay for around 90 days! Name Link Commit ed99bfd Logs https://github.com/dapplets/mutable-web-monorepo/actions/runs/12485503246 Extension Build https://github.com/dapplets/mutable-web-monorepo/suites/32419971986/artifacts/2360050429"
      }
    }
  ]
}
```

## Publish agent container

Build and push the agent to the GitHub Container Registry:

```sh
cd mutable-web-monorepo
docker buildx create --use # if you didn't it before
docker buildx build --platform linux/amd64,linux/arm64 -f agents/crawler/Dockerfile . --tag ghcr.io/dapplets/crawler-agent:latest --push
```
