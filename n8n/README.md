# Aigency x Xen — n8n Workflows

This repository contains several [n8n](https://n8n.io/) workflow JSON files. You can import them into your n8n instance to automate various tasks involving the NEAR AI API and other utilities.

## Getting Started

```
cd n8n
docker compose pull
docker compose create && docker compose up
```

## Importing a Workflow

```
n8n import:workflow --input=workflows.json
```

## Workflows Overview

* `main` — Serves as the primary assistant workflow. It processes user inputs, retrieves and synthesizes external market and database data, and returns interactive responses to users via chat channels.

* `track` — Monitors real‐time market data and trading signals for a specific cryptocurrency. It uses a chain of language models, technical analysis, and external API calls to generate trade recommendations and then notifies users via Telegram.

* `dept` — Delegates tasks by selecting the most suitable AI agent for a given task. It aggregates information from the database and external sources, then passes the task to an agent for further processing.

* `voice-tool` — Converts user text into speech by leveraging an audio-enabled language model. The workflow receives voice query inputs, processes them, and sends the generated audio output back to the user through Telegram.

* `testing-only` — A dedicated workflow for running tests and experiments. It demonstrates integrations with file conversion, vector storage (using Qdrant), and embedding generation. It’s used for verifying internal processing and data transformations.

* `consciousness` — Acts as a memory guardian that extracts, aggregates, and summarizes personal data from ongoing conversations. This workflow maintains a record of user interactions to build a context-aware internal memory.

* `task-checker` — Regularly checks and monitors tasks and reminders stored in the database. It verifies completion statuses and sends notifications to the user when items are due or require attention.

* `forecast-reddits` — Aggregates and analyzes news from multiple subreddits. This workflow fetches Reddit RSS feeds, applies filters based on recency, and identifies important news items, helping to forecast trending topics.

* `reddits` — Manages subreddit subscriptions by validating the input command, subscribing to the specified subreddit feed, and ensuring that only correctly formatted subreddit names are processed.

* `Delivery` — Curates and delivers news to users based on personal preferences. It receives, formats, and sends news items that have been analyzed for relevance, ensuring that the most important information reaches the user.

* `global-error-handler` — Catches workflow errors globally. When an error is detected, it packages the error message, stack trace, and relevant workflow details and sends a formatted report to a dedicated Telegram chat for prompt troubleshooting.

* `backups` — Provides automated backups of workflow configurations. This workflow gathers workflow definitions, creates a deterministic JSON representation of each, and commits them to a GitHub repository for version control.

* `Subscriptions` — Retrieves and displays a user’s active subscriptions. It queries the database for current subscriptions, aggregates the data, and summarizes the information for the user in a clear format.

Use these workflows as references or building blocks for your own integrations. Ensure that any credentials (e.g., Telegram, Postgres, OpenAI) are properly configured in n8n before execution.