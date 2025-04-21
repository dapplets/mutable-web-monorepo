# Aigency x Xen — n8n Workflows

## Prerequisites

1. **Provision a VPS** with a public IP address. We tested Aigency (without running an LLM locally) on a server with **2 vCPU, 4 GB RAM, 40 GB SSD** running **Ubuntu 24.04 LTS**.

2. **Point a domain name** to your VPS by creating an **A‑record** for its IP address.

3. **Install Docker** — for example, by following [this guide](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04).

4. **Create a Telegram bot** via **@BotFather** and save its API token.

5. **Generate an OpenAI API key** at <https://platform.openai.com/api-keys>.

6. **Obtain a NEAR AI API key** from <https://near.ai/>. After signing in, look for a cookie named `auth`.

## Installation

1. **Clone the repository** and switch to the `n8n` directory:

   ```bash
   git clone https://github.com/dapplets/mutable-web-monorepo.git
   cd mutable-web-monorepo/n8n
   ```

2. **Create and edit the environment file**:

   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Start the Docker containers**:

   ```bash
   docker compose pull
   docker compose create
   docker compose up -d
   ```

4. **Open** `https://<YOUR_DOMAIN>` in your browser.

5. **Create your n8n user account** when prompted.

6. **Verify that the workflows imported successfully** and that some are active.  
   The `main` workflow will show an error at first; we’ll fix that next.

7. **Open the "Credentials" tab** to add your keys.

8. In **"Telegram API"**, paste your bot token.

9. In **"NEAR AI API Key"**, set **Name** to `Authorization` and **Value** to:

   ```
   Bearer <YOUR_NEAR_AI_TOKEN>
   ```

   Example (do **not** copy verbatim):

   ```
   Bearer {"account_id":"example.near","public_key":"ed25519:deadbeef","signature":"cafebabe","callback_url":"https://app.near.ai/sign-in/callback","message":"Welcome to NEAR AI Hub!","recipient":"ai.near","nonce":"00000000000000000001744312345678"}
   ```

10. In **"OpenAI"**, paste your OpenAI API key.

11. Return to the **"Workflows"** tab and confirm that all errors are gone.

12. **Start chatting** with your Telegram bot—everything should be ready!

### Uninstallation

To stop and remove the containers, networks, volumes, and images created for Aigency, run the following command from the `n8n` directory:

```bash
docker compose down --volumes
```