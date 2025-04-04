# Aigency x Xen — n8n Workflows

This repository contains several [n8n](https://n8n.io/) workflow JSON files. You can import them into your n8n instance to automate various tasks involving the NEAR AI API and other utilities.

## Importing a Workflow

1. Open your n8n Editor UI.

2. Click on the “Import” button in the top right corner.

3. Select “Import from File” and choose one of the JSON files from this repository.

4. Adjust credentials, environment variables, or parameters as needed.

## Workflows Overview

* `main.json` — The primary Telegram-based workflow. Manages user interactions, fetches or stores messages, integrates with memory (Postgres / Qdrant), and delegates tasks to sub-workflows or “tools” like Dept or Voice.

* `voice_tool.json` — Converts text input into a voice response using OpenAI’s text-to-speech and sends the result back to a specified Telegram chat.

* `dept.json` — Handles “department” assignments: selects an agent from a database and forwards user queries to that agent on NEAR AI.

* `call_multiple_near_agents.json` — Finds the appropriate NEAR AI agents based on user query, then creates and retrieves responses from multiple agent threads.

* `call_near_ai_agent.json` —  A simpler workflow that calls a single NEAR AI agent. Creates a thread, sends a message, and fetches the agent’s response.

* `get_all_near_ai_agents.json` — Retrieves a list of NEAR AI agents from the registry and upserts them into a local Postgres database for tracking.

Use these workflows as references or building blocks for your own integrations. Ensure that any credentials (e.g., Telegram, Postgres, OpenAI) are properly configured in n8n before execution.